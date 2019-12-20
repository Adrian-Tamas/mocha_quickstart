const faker = require("faker");

module.exports = function Book({id = undefined,
                                   name=faker.lorem.words(5),
                                   author=`${faker.name.firstName()} ${faker.name.lastName()}`,
                                   description=faker.lorem.paragraph(),
                                   cover=faker.internet.url()} = {}) {
    let book = {};

    if (id !== undefined) {
        book.id = id;
    }
    book.name = name;
    book.author = author;
    book.description = description;
    book.cover = cover;

    return book;
};