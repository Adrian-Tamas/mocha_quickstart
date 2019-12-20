const faker = require("faker");

module.exports = function User({id = undefined,
                                   first_name=faker.name.firstName(),
                                   last_name=faker.name.lastName(),
                                   email=faker.internet.email()} = {}) {
    let user = {};

    if (id !== undefined) {
        user.id = id;
    }
    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;

    return user;
};
