const createError = require("http-errors");
const express = require("express");
const helmet = require("helmet");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const sassMiddleware = require("node-sass-middleware");
const dotenv = require("dotenv");

dotenv.config(); // Read the '.env' file

// Get the database config.
// ! This line MUST be initialized after 'dotenv.config()' for recognizing the variables from '.env' file
const database = require("./config/database");

/**
 * Creates a global helper that returns a relative path for a required custom module of the app.
 * Sources of help:
 * - https://www.coreycleary.me/escaping-relative-path-hell
 * - https://kenichishibata.medium.com/3-ways-to-fix-relative-paths-in-nodejs-require-ffc7f89bd7e1
 * @param   {string} path
 * @return {object} [require]
 */
global.include = path => require(__dirname + "/" + path);

const apiRouter = require("./routes/api");
const webRouter = require("./routes/web");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(helmet());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join("./", "public"),
    dest: path.join("./", "public"),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(express.static(path.join("./", "public")));


// Bootstrap 5 dependencies
app.use("/css", express.static(path.join("./", "node_modules/bootstrap/dist/css")));
app.use("/js", express.static(path.join("./", "node_modules/bootstrap/dist/js")));
// app.use("/js", express.static(path.join("./", "node_modules/jquery/dist")));

// Defining 'web' and 'api' routes
app.use("/", webRouter);
app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// Connecting to a database using MongoDB
if (process.env.NODE_ENV !== "test") {
    database.connect();
}

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.format({
        "text/plain": () => res.send(err.message),
        "text/html": () => res.render("error"),
        "application/json": () => res.json(err),
        "default": () => res.status(406).send("Not Acceptable") // log the request and respond with 406
    });
});

module.exports = app;
