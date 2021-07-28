const Category = require("../models/category.model");
const Course = require("../models/course.model");

const CategoryController = {
    index: ((req, res) => {
        // Create a new object called 'query'
        // but removing 'populate_with' and 'select_only' fields from 'req.query'
        // and isolating each of them ('populate_with' and 'select_only') as a string variable
        const { populate_with, select_only, ...query } = req.query;

        Category
            .find(query, (err, category) => {
                if (err) return res.send(500, err.message);
                res.status(200).jsonp(category);
            })
            .populate(populate_with)
            .select(select_only);
    })
};

module.exports = CategoryController;
