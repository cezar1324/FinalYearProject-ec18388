const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/', authController.isLoggedIn, (req, res) =>  {
    res.render('index', {
        user: req.user
    });
});
router.get('/register',authController.isLoggedIn, (req, res) => {
    if(req.user){
        res.redirect("/")    
    }
    res.render('register');
});
router.get('/login' ,authController.isLoggedIn, (req, res) => {
    if(req.user){
        res.redirect("/")    
    }
    res.render('login');
});

router.get('/profile', authController.isLoggedIn, (req, res) => {
    if( req.user ) {
        res.render('profile',{
            user: req.user
        });
    } else{
        res.redirect('/login');
    }
});

router.get('/movies',authController.isLoggedIn, authController.getMovieData, (req, res) => {
    if( req.user ) {
        res.render('movies',{
            movielist1: req.movielist
        });
    } else{
        res.redirect('/login');
    }
});


module.exports = router;