var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
const dotenv = require('dotenv');

dotenv.config(); // Read the '.env' file

// Get the database config.
// ! This line MUST be initialized after 'dotenv.config()' for recognizing the variables from '.env' file
const database = require("./database");

/**
 * Creates a global helper that returns a relative path for a required custom module of the app.
 * Sources of help:
 * - https://www.coreycleary.me/escaping-relative-path-hell
 * - https://kenichishibata.medium.com/3-ways-to-fix-relative-paths-in-nodejs-require-ffc7f89bd7e1
 * @param   string path
 * @returns object [require]
 */
global.include = path => require(__dirname + "/" + path);

var apiRouter = require("./routes/api");
var webRouter = require("./routes/web");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Bootstrap 5 dependencies
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
// app.use('/js', express.static(path.join(_dirname, 'node_modules/jquery/dist')));

// Defining 'web' and 'api' routes
app.use('/', webRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Connecting to a database using MongoDB
database.connect();

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
