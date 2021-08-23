const User = include("models/user.model");

const UserController = {
    index: ((req, res) => {
        User.find(req.query, (err, users) => {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(users);
        });
    }),
    store: ((req, res) => {
        User.create(req.body, (err, user) => {
            if (err) return res.status(500).send(err.message);

            res.status(201).jsonp(user);
        });
    }),
    show: ((req, res) => {
        User.findById(req.params.id, function (err, user) {
            if (err) return res.status(500).send(err.message);

            res.status(200).jsonp(user);
        });
    }),
    update: ((req, res) => {
        User.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, user) => {
            // NOTE: '{ new: true }' returns the updated document (user) inside the callback
            // Source: https://davidburgos.blog/return-updated-document-mongoose/

            if (err) return res.status(500).send(err.message);

            res.status(200).jsonp(user);
        });
    }),
    destroy: ((req, res) => {
        User.findByIdAndDelete(req.params.id, (err) => {
            if (err) return res.status(500).send(err.message);

            res.status(204).send();
        });
    })
};

module.exports = UserController;
