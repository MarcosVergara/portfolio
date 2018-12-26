
var express = require('express');
var router = express.Router();

var users = require('./users');
var requests = require('./requests');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/contact', function(req, res, next) {
  res.render('contact');
});

router.get('/marcos', function(req, res, next) {
  res.render('marcos');
});

router.get('/about-us', function(req, res, next) {
  res.render('about');
});

router.post('/register-user', users.registerUser);

router.get('/login-form', users.getLogin);

router.get('/admin-panel', requests.getRequests);

router.post('/login', users.login);

router.post('/send-request', users.requiresRegister, requests.sendRequest);


module.exports = router;
