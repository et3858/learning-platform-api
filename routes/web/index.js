var express = require("express");
var router = express.Router();

const Category = include("models/category.model");

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render("index", { title: "Express" });
  res.render("index", { title: "Mi proyecto con Express" });
});

/* GET my-page. */
router.get('/lol', function(req, res, next) {
  Category
    .find({})
    .populate("courses")
    .exec((err, categories) => {
      if (err) return res.send(500, err.message);

      res.render("my-page", { categories });
    })
});

module.exports = router;
