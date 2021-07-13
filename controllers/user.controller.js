// const UserModel = require("../models/user.model");
const User = require("../models/user.model.db");

const UserController = {
    index: ((req, res) => {
        User.find(function (err, users) {
            if (err) res.send(500, err.message);
            res.status(200).jsonp(users);
        });
    }),
    store: ((req, res) => {
        var user = new User({
            name: req.body.name,
        });

        user.save(function (err, user) {
            if (err) return res.status(500).send(err.message);
            res.status(200).jsonp(user);
        });
    }),
    show: ((req, res) => {
        User.findById(req.params.id, function (err, user) {
            if (err) return res.status(500).send(err.message);

            if (user) {
                res.status(200).jsonp(user);
            } else {
                res.send();
            }
        });
    }),
    update: ((req, res) => {
        User.findById(req.params.id, function(err, user) {
            if (err) return res.status(500).send(err.message);

            // Stop the process if user doesn't exist
            if (!user) {
                res.send();
                return;
            }

            user.name = req.body.name;

            user.save(function (err) {
                if (err) return res.status(500).send(err.message);
                res.status(200).jsonp(user);
            });
        });
    }),
    destroy: ((req, res) => {
        User.findById(req.params.id, function (err, user) {
            if (err) return res.status(500).send(err.message);

            // Stop the process if user doesn't exist
            if (!user) {
                res.send();
                return;
            }

            user.remove(function (err) {
                if (err) return res.status(500).send(err.message);
                res.status(200).send();
            });
        });
    })
};

module.exports = UserController;
