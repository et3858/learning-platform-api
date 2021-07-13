const UserModel = require("../models/user.model");

const UserController = {
    index: ((req, res) => {
        let users = UserModel.getUsers();
        res.json(users);
    }),
    store: ((req, res) => {
        UserModel.addUser(req.body);
        res.send("Aplicando store() en UserController");
    }),
    show: ((req, res) => {
        let user = UserModel.getUserByID(req.params.id);
        res.json(user);
    }),
    update: ((req, res) => {
        UserModel.editUser(req.body, req.params.id);
        res.send("Aplicando update() en UserController");
    }),
    destroy: ((req, res) => {
        UserModel.deleteUser(req.params.id);
        res.send("Aplicando destroy() en UserController");
    })
};

module.exports = UserController;
