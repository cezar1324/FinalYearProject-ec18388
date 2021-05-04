const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const fs = require("fs");
//file system


dotenv.config({ path: './.env'})

const app = express();
// start the server

//use .env file for our sensitive content
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
})

//frontend files location specification
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));


//This parses the URL-encoded bodies (as they are sent by HTML forms)
//so we can grab the data from any forms
app.use(express.urlencoded({extended: false}));
//Assuers that the values that comes from the form are jsons/ and grabs data from forms
app.use(express.json());

app.use(cookieParser());


//Connect to our database named FinalYearProject
db.connect( (error) => {
    if(error){
        console.log(error)
    } else{
        console.log("MYSQL Conection sucesfully...")
    }
});



app.set('view engine', 'hbs');
var hbs = require('hbs');
hbs.registerHelper('ifequal', function(v1, v2, options) {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

//specify the view engine to the app 



//Define Routes
app.use('/', require('./routes/pages'));

//anylink that strats with /auth will require the routes of auth.
app.use('/auth', require('./routes/auth'));


app.listen(8080, () => {
    console.log("Server started on port 8080");
})

db.query('SELECT * FROM movies', async (error, results) => {
    for(let i = 0; i < results.length; i++){
        results[i].Image = "data:image/png;base64, "+results[0].Image.toString('base64');
    }
});


app.get("/lobby/:token", function(req, res){
    const token = req.header.token;
    

});

app.get("/video/:MovieName", function (req, res) {
    // Ensure there is a range given for the video
    const range = req.headers.range; // this range is done automathicaly by HTML 5 video player.
    if (!range) {
      res.status(400).send("Requires Range header");
    }
  
    const videoPath =  "videos/"+req.params.MovieName+".mp4";  // location in our server(in our files) for the video
    const videoSize = fs.statSync(videoPath).size;//this allows us to check the size of the video
    // Parse Range
    const CHUNK_SIZE = 10 ** 6; // this represents 1MB of data per chunk that will be sent back as the response to the request
    const start = Number(range.replace(/\D/g, "")); //removes every non-digit character from our range header in order to get a number for the start
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1); // here we calculate the ending byte that we send back 
    
  
    // Create returning headers
    const contentLength = end - start + 1;

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,//this is how the video player knows how far the content loaded
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",//some proprities
    };
  
    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);//this is the actual response header back to the front end
  
    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });
  
    // Stream the video chunk to the client
    videoStream.pipe(res);
  });



