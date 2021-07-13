//Keep the meals data inside of an Array (in Real World this would be saved in a database)
// Source: https://medium.com/@ipenywis/what-is-the-mvc-creating-a-node-js-express-mvc-application-da10625a4eda
const users = [
    { id: 1, name: "MilkShake", type: "breakfast", price: 8 },
    { id: 2, name: "Lazanya", type: "lunch", price: 20 }
];


const UserModel = {
    /**
     * Get all users
     * @return array [List of objects]
     */
    getUsers() {
        return users;
    },
    /**
     * Find the user by its ID
     * @param  int              id [Leave a description]
     * @return object|undefined
     */
    getUserByID(id) {
        return users.find(u => u.id == id);
    },
    /**
     * Add a new user
     * @param object user [Leave a description]
     */
    addUser(user) {
        let users = this.getUsers();
        user.id = users.length + 1;
        users.push(user);
    },
    /**
     * Edit an existing user
     * @param object user [Leave a description]
     * @param int    id [Leave a description]
     */
    editUser(user, id) {
        let index = this.getUsers().findIndex(u => u.id == id);
        if (index > -1) {
            users[index].name = user.name;
            users[index].type = user.type;
            users[index].price = user.price;
        }
    },
    /**
     * Delete an existing user
     * @param int id [Leave a description]
     */
    deleteUser(id) {
        let index = this.getUsers().findIndex(u => u.id == id);
        if (index > -1) {
            users.splice(index, 1);
        }
    }
}

module.exports = UserModel;
