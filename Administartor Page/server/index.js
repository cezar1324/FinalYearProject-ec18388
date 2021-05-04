const express = require('express');
const app = express();
const cors = require('cors');
var fs = require('fs');
const bcrypt = require('bcryptjs');

app.use(cors());
app.use(express.json());

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "finalyearproject"
});


con.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});

app.post('/add-movie', cors(), (req, res) => {
    const name = req.body.name;
    const image = req.body.image;
    const description = req.body.description;
    const type1 = req.body.type1;
    const type2 = req.body.type2;
    const special = "special";
    fs.readFile(image, (err, data) => {
      con.query("INSERT INTO movies (MovieName, Image, Description, type1, type2) value ('"+name+"', '"+data.toString('base64')+"','"+description+"', '"+type1+"', '"+type2+"')", function (err, result, fields) {
          if (err){
              res.json({add : 'false'});
          }
          res.json({add : 'true'});
      });
    });
});

app.post('/del-movie', cors(), (req, res) => {
    const name = req.body.name;

    con.query("DELETE FROM movies WHERE MovieName = '"+name+"'", function (err, result, fields) {
        if (err){
            res.json({del : 'false'});
        }
        res.json({del : 'true'});
    });
});

app.post('/modify-user', cors(), async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    let hashedPassword = await bcrypt.hash(password, 8)

    con.query("UPDATE users SET password = '"+hashedPassword+"' WHERE email = '"+email+"'", function (err, result, fields) {
        if (err){
            res.json({modify : 'false'});
        }
        res.json({modify : 'true'});
    });
});



app.get('/movies', cors(), (req,res) => {
    con.query("SELECT * FROM movies", function (err, result, fields) {
      if (err) throw err;
      res.json(result)
    });
})

app.listen(3000);