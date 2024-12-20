const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const PEPPER = String(process.env.PEPPER);
const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const SQL = "SELECT * FROM users;"

const app = express();
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});


app.use("/", express.static("frontend"));


app.get("/query", function (request, response) {
  connection.query(SQL, [true], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("database error");
    } else {
      console.log(results);
      response.send(results);
    }
  });
})

app.post("/login", function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  let SQL = "SELECT * FROM users WHERE username='" + username + "';";
  connection.query(SQL, [true], (err, results, fields) => {
    if (err) {
      console.error("Database Error: \n", err.message);
      res.status(500).send("Server Error");
    }
    else {
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
