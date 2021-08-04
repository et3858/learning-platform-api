const Category = include("models/category.model");

const CategoryController = {
    index: ((req, res) => {
        // Create a new object called 'query'
        // but removing 'populate_with' and 'select_only' fields from 'req.query'
        // and isolating each of them ('populate_with' and 'select_only') as a string variable
        const { populate_with, select_only, ...query } = req.query;

        Category
            .find(query)
            .deepPopulate(populate_with)
            .select(select_only)
            .exec((err, categories) => {
                if (err) return res.send(500, err.message);
                res.status(200).jsonp(categories);
            });
    })
};

module.exports = CategoryController;
