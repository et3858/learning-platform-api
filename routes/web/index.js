var express = require("express");
// var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render("index", { title: "Express" });
  res.render("index", { title: "Mi proyecto con Express" });
});

module.exports = router;
