const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

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

app.post("/validateToken", (req, res) => {
  console.log("Validating token: ");

  let token = req.body.token;

  console.log(token);

  jwt.verify(token, JWTSECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send("Invalid Token");
    }

    let userData = decoded.userData;
    console.log(userData);
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
          console.log("Token Created: ");
          console.log(token);
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
