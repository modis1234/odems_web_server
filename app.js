var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");

var session = require('express-session');
var MySQLStore = require('express-mysql-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var networkRouter = require('./routes/networkRouter');
var deviceRouter = require('./routes/deviceRouter');
var companyRouter = require('./routes/companyRouter');
var siteRouter = require('./routes/siteRouter');
var upsRouter = require('./routes/upsRouter');
var accountRouter = require('./routes/accountRouter');


var http = require('http');

var app = express();

var dbconfig = require('./routes/config/database');
var sessionStore = new MySQLStore(dbconfig);
app.use(session({
  secret: "asdfasdfdas",
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/network', networkRouter);
app.use('/device', deviceRouter);
app.use('/company', companyRouter);
app.use('/site', siteRouter);
app.use('/ups', upsRouter);
app.use('/account', accountRouter);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// http.createServer(app).listen(9091, function () {
//   console.log('서버 실행 9091포트로 웹서버 실행!!');
// });


module.exports = app;
