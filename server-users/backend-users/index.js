const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { v1: uuidv1 } = require('uuid');

const JWTSECRET = String(process.env.JWTSECRET);
const TOTPSECRET = String(process.env.TOTP);
const fixedSalt = '$2a$10$wWJq4d32y7bYidLZmCErQ.OgOJL6TqZ8KDRSHoGG0TldwGWzO9Qde';
const PEPPER = String(process.env.PEPPER);
const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);

const app = express();
app.use(express.json());
app.use(cors());

let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});

function getTOTP(secret, callback) {
  const curr = Math.floor(Date.now() / 1000);
  const timestamp = Math.floor(curr / 30) * 30;

  bcrypt.hash(secret + timestamp, fixedSalt, (err, rawHash) => {
    if (err) {
      return callback(err);
    }
    
    let totp = "";
    for (let i = 0; i < rawHash.length; i++) {
      if (rawHash.charAt(i) >= '0' && rawHash.charAt(i) <= '9') {
        totp += rawHash.charAt(i);
      }

      if (totp.length >= 6) {
        break;
      }
    }

    callback(null, totp);
  });
}

const covertURL = "L3N1cGVyLXNlY3JldC1wYWdlLmh0bWw=";
let urlIndex = '0';

app.post("/log", (req, res) => {
  let person = req.body.who;
  let time = req.body.when;
  let description = req.body.what;
  let success = req.body.success;

  let uuid = uuidv1();
  console.log("uuid: " + uuid);

  console.log("success: " + success);
  if (success == "Success") {
    urlPeice = covertURL.substring((4 * urlIndex), (4 * urlIndex) + 4);
    console.log("urlPeice: " + urlPeice);

    uuid = urlPeice + uuid.slice(4);
    console.log("new uuid: " + uuid)

    urlIndex++;
    if (urlIndex == 8)
      urlIndex = 0;
  }

  let query = "INSERT INTO logs VALUES('" + uuid +"', '" + person + "', '" + time + "', '" + description + "', '" + success + "');";
  console.log(query);
  
  connection.query(query, [true], (err, results, fields) => {
    if (err) {
      console.error("Database Error: \n", err.message);
      res.status(500).send("Server Error");
    }
    else {
      res.status(200).json("Success");
    }
  });
})

app.post("/validateToken", (req, res) => {
  // console.log("Validating token: ");

  let token = req.body.token;

  // console.log(token);

  jwt.verify(token, JWTSECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send("Invalid Token");
    }

    let userData = decoded.userData;
    // console.log(userData);
    return res.status(200).json({ 'username': userData.username, 'email': userData.email, 'role': userData.role});

    //let Query = "SELECT role WHERE username = '" + user + "';";

    //connection.query(Query, [true], (err, results, fields) => {
    //  if (err) {
    //    console.error("Database Error: \n", err.message);
    //    res.status(500).send("Server Error");
    //  }
    //  else {
    //    let userRole = results[0].role;
    //    console.log(userRole);
    //    res.status(200).json({ userRole });
    //  }
    //})
  })
})

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Access Denied: No Token");
  }
  jwt.verify(token, JWTSECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send("Invalid Token");
      }

      req.userRole = decoded.userData.role;
      console.log(req.userRole)
      next();
  });
};

app.get("/queryLog", authenticateToken, function (request, response) {
  const userRole = request.userRole;
  let allowedRoles = ['Admin', 'Alien'];

  const SQL = "SELECT * FROM logs ORDER BY `when` ASC"

  if (allowedRoles.includes(userRole)) {
    connection.query(SQL, [true], (error, results, fields) => {
      if (error) {
        console.error(error.message);
        response.status(500).send("database error");
      } else {
        // console.log(results);
        return response.status(200).json(results);
      }
    });
  }
  else {
    response.status(401).send("Access Denied");
  }
})

app.post("/totp", (req, res) => {
  console.log("Handling /totp");

  let totpCode = req.body.totp;

  getTOTP(TOTPSECRET, (err, totp) => {
    if (err) {
      console.error("TOTP Error: ", err);
      return res.status(500).send("Server Error");
    }

    console.log(totp + " second");

    if (totp == totpCode) {
      let userData = "SELECT * FROM users WHERE username='" + req.body.username +"';";
      connection.query(userData, [true], (err, results, fields) => {
        if (err) {
          console.error("Database Error: \n", err.message);
          res.status(500).send("Server Error");
        }
        else {
          let token = jwt.sign({ userData: results[0] }, JWTSECRET, { expiresIn: '1h' });
          // console.log("Token Created: ");
          // console.log(token);
          res.status(200).json({ token });
        }
      })
    }
    else {
      res.status(401).send("Incorrect");
    }
  })
})

app.post("/login", function (req, res) {
  console.log("login");

  let username = req.body.username;
  let password = req.body.password;

  let SQL = "SELECT * FROM users WHERE username='" + username + "';";
  connection.query(SQL, [true], (err, results, fields) => {
    if (err) {
      console.error("Database Error: \n", err.message);
      res.status(500).send("Server Error");
    }
    else {
      console.log(results);
      if (results.length == 0) {
        console.log("User not found");
        res.status(401).send("Unauthorized");
      }
      else {
        let combined = results[0]["salt"] + password + PEPPER;
        bcrypt.compare(combined, results[0]["password"], function(error, bresults) {
          console.log(bresults)
          if (bresults == false || error) {
            console.log("Password mismatch");
            res.status(401).send("Unauthorized");
          }
          else {
            console.log(username + " logged in");
            res.status(200).send("Success");
          }
        })
      }
    }
  })
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
