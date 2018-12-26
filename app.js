var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
const PORT = process.env.PORT || 5000;
var router = require('./routes/router');

console.log(PORT);
express()
  .use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: false
  }))
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .use(logger('dev'))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use('/', router)
  .use(function(req, res, next){
    res.status(404).render('404_error_template', {title: "Sorry, page not found"});
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
  






/*
// error handler
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/
