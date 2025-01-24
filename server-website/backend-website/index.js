const express = require("express");
const mysql = require("mysql2");
const axios = require('axios');

const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);

const app = express();
app.use(express.json());

let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "aliens"
});


app.use("/", express.static("frontend"));


async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send("Access Denied");
  }

  const payload = {
    token: token
  };

  try {
    const response = await axios.post('http://server-users:8001/validateToken', payload);

    if (response.status = 200) {
      req.userRole = response.data.role;
      next();
    }
    else {
      return res.status(401).send("Access Denied");
    }
  }
  catch (err) {
    console.log(err);
  }

  // send separate request to the users server
}

app.get("/query", authenticateToken, function (request, response) {
  const userRole = request.userRole;
  const dataLocation = request.headers['entries'];

  // Change the requested table based on the imported data
  const SQL = `SELECT * FROM ${dataLocation}`
  console.log(SQL)

  if (userRole == "Human" || userRole == "Admin" || userRole == "Alien") {
    connection.query(SQL, [true], (error, results, fields) => {
      if (error) {
        console.error(error.message);
        response.status(500).send("database error");
      } else {
        response.send(results);
      }
    });
  }
  else {
    response.status(401).send("Access Denied");
  }
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
