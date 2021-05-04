const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

//load authController and use the function register 
router.post('/register', authController.register);

//use the login function inside the authController
router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.post('/playmovie', authController.playmovie);

router.post('/description', authController.description);

router.post('/picture', authController.picture);


module.exports = router;