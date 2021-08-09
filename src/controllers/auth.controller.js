const jwt = require("jsonwebtoken");
const User = include("models/user.model");
const auth = include("config/auth");

const AuthController = {
    login: ((req, res) => {
        const { password, ...body } = req.body;

        User.findOne(body, (err, user) => {
            if (err) return res.status(500).send(err.message);

            if (!user) return res.status(404).send("user not found");

            user.passwordComparison(password, (err, isMatch) => {
                if (err) return res.status(500).send(err.message);

                if (!isMatch) return res.status(401).send("unauthenticated user");

                let jwtUser = (({ _id, email, name, username }) => ({ _id, email, name, username }))(user);

                jwt.sign({ user: jwtUser }, auth.jwt.secret, (err, token) => {
                    if (err) return res.status(500).send(err.message);
                    res.status(200).json({ token });
                });
            });
        });
    })
    // logout: ((req, res) => {
    //     // 
    // })
};

module.exports = AuthController;
