const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
})



exports.login = async(req, res) => {
    try{

        const { email, password } = req.body;
// check if someone submits an empty form
        if( !email || !password ){
            return res.status(400).render('login',{
                message:'No email or password'
            })
        }
//i use "?" which is called positional parameter in order to protect against SQL injection
        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            console.log(results);
            if( !results || !(await bcrypt.compare(password, results[0].password)) ){

                res.status(401).render('login', {
                    message: 'Email or Password is incorrect'
                })
            }else{
                const id = results[0].id;
                
            const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {

                expiresIn: process.env.JWT_EXPIRES_IN
            });
                console.log("Our token is " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions );
                res.status(200).redirect("/")
            }
            
        })

    } catch (error){
        console.log(error);
    }

}

exports.register = (req, res) => {
    console.log(req.body);
    //const name = req.body.name;
    //const email = req.....
    // simplifing the code with js destructuring
    const{ email, fname, lname, password, passwordConfirm } = req.body;



    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if(error) {
            console.log(error);
            return res.render('profile');
        }
        //checks if an email is already in the databaze, so if its in the database the length would be bigger than 0
        if( results.length > 0 ){
            return res.render('register',{
                message: 'Email is already in use'
            })
        }else if(password !== passwordConfirm){
            return res.render('register',{
                message: 'Passwords do not match'
        });
       }
       var s = password.toString();
       var r = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
       if(r.test(s) == false){
        return res.render('register',{
            message: 'Password must contain at least 1 uppercase, 1 lowercase letter and one digit'
        });
        }


       //use 8 rounds of encription for bcrypt in order to be secure
       let hashedPassword = await bcrypt.hash(password, 8)

       db.query('INSERT INTO users SET ? ', {fname : fname, lname : lname, email : email, password : hashedPassword }, (error, results) => {
            if(error){
                console.log(error);
            } else{
                console.log(results);
                return res.render('register', {
                    message: 'User registered'
                });
            }
       })
    });

}

exports.isLoggedIn = async (req, res, next) => {
   //console.log(req.cookies);
    if( req.cookies.jwt ){
        try{
            //check the token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt,
            process.env.JWT_SECRET
            );
            console.log(decoded);
            // Verify if the user still exists
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
                console.log(result);
                if(!result){
                    return next();
                }
                req.user = result[0];
                return next();
            });
        } catch(error){
            console.log(error)
            return next();
        }
    } else{
        next();
    }
}

//logout function, it replaces the jwt to a new one called logout that expires after 2 ms after the logoutbutton is pressed
exports.logout = async (req, res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2*100),
        httpOnly: true
    });
    res.status(200).redirect('/');
}

exports.getMovieData = async (req, res, next) => {
     if( req.cookies.jwt ){
         try{
             const decoded = await promisify(jwt.verify)(req.cookies.jwt,
             process.env.JWT_SECRET
             );
             db.query('SELECT * FROM movies', (error, results) => {
                r = /=/;
                for(let i = 0; i < results.length; i++){
                    //console.log(results[i].Image.startsWith("special"));
                    if( r.test(results[i].Image)){
                        results[i].Image = "data:image/png;base64, "+results[i].Image.toString('base64');
                        
                    }else {
                        results[i].Image = "data:image/png;base64, "+results[i].Image
                    }
                }
                
                 req.movielist = results;
                 return next();
             });
         } catch(error){
             console.log(error)
             return next();
         }
     } else{
         next();
     }
 }

 exports.playmovie = async (req, res, next) => {
    const MovieName  = req.body.MovieName;
    console.log(req.body);
    return res.render('video', {
       MovieName : MovieName
    });
 }


exports.description = (req, res) => {
    console.log(req.body);

    const description = req.body.description;
    const userid = req.body.userid;

    db.query('UPDATE users set ? WHERE id =' + userid + '', {description : description},(error, results) =>{
        if(error){
            console.log(error);
        } else{
            res.redirect('../profile');
        }
    });
}

exports.picture = (req, res) => {
    
    console.log("not working")
    console.log(req.body.photo);

    res.redirect('../movies');
}