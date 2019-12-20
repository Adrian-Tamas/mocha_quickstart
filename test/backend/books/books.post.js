const book = require("../../../models/book");
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect =  chai.expect;
const api_get = require("../../../actions/backend/api_get");
const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('Create Books Endpoint', function() {
    let created_books = [];
    let url, books_payload;

    beforeEach(async () => {
        url = global.backend_url + "/books";
        books_payload = book();
    });

    after(async () => {
        for (const entry of created_books) {
            let url = global.backend_url + `/books/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('creates a book', function () {
        it('when using a valid payload with all fields', async function () {
            let book_resp = await api_post({url: url, payload: books_payload});
            expect(book_resp.status_code).to.equal(200, "Book was created");
            expect(book_resp.data).excluding("id").to.deep.equal(books_payload, "Book was created correctly");
            url = url + `/${book_resp.data.id}`;
            let book_resource = await api_get({url: url});
            expect(book_resp.data).to.deep.equal(book_resource.data, "Book was also saved");
            created_books.push(book_resp.data.id);
        });

        it('when using a valid payload with just the required fields', async function () {
            let edited_book_payload = Object.assign({}, books_payload);
            delete edited_book_payload.cover;
            delete edited_book_payload.description;
            books_payload.cover = null;
            books_payload.description = null;
            let book_resp = await api_post({url: url, payload: edited_book_payload});
            expect(book_resp.status_code).to.equal(200, "Book was created");
            expect(book_resp.data).excluding("id").to.deep.equal(books_payload, "Book was created correctly");
            created_books.push(book_resp.data.id);
        });

        it('when creating a book with the same name for a different author', async function () {
            let book_resp = await api_post({url: url, payload: books_payload});
            expect(book_resp.status_code).to.equal(200, "Book was created");
            expect(books_payload).excluding("id").to.deep.equal(book_resp.data, "Book was created correctly");
            let edited_book_payload = Object.assign({}, book_resp.data);
            edited_book_payload.author = "New Author";
            let new_book_resp = await api_post({url: url, payload: edited_book_payload});
            expect(new_book_resp.status_code).to.equal(200, "Book was created");
            expect(new_book_resp.data).excluding("id").to.deep.equal(edited_book_payload, "Book was created correctly");
            created_books.push(book_resp.data.id);
            created_books.push(new_book_resp.data.id);
        });

        it('when creating a book with a different name by the same author', async function () {
            let book_resp = await api_post({url: url, payload: books_payload});
            expect(book_resp.status_code).to.equal(200, "Book was created");
            expect(books_payload).excluding("id").to.deep.equal(book_resp.data, "Book was created correctly");
            let new_book_payload = book({author: books_payload.author});
            let new_book_resp = await api_post({url: url, payload: new_book_payload});
            expect(new_book_resp.status_code).to.equal(200, "Book was created");
            expect(new_book_resp.data).excluding("id").to.deep.equal(new_book_payload, "Book was created correctly");
            expect(book_resp.data.author).to.equal(new_book_resp.data.author);
            created_books.push(book_resp.data.id);
            created_books.push(new_book_resp.data.id);
        });
    });

    describe('fails', function () {
        it('for the same name and author', async function () {
            let book_resp = await api_post({url: url, payload: books_payload});
            expect(book_resp.status_code).to.equal(200, "Book was created");
            let new_book_resp = await api_post({url: url, payload: books_payload});
            expect(new_book_resp.status_code).to.equal(400, "Book was not created");
            expect(new_book_resp.data).to.equal(`Book with name: ${books_payload.name} written by author: ${books_payload.author} already exists`);
            created_books.push(book_resp.data.id);
        });

        it('if the name is not specified', async function () {
            delete books_payload.name;
            let book_resp = await api_post({url: url, payload: books_payload});
            expect(book_resp.status_code).to.equal(400, "Book was not created");
            expect(book_resp.data).to.equal("'name' is required");
        });

        it('if the name is null', async function () {
            books_payload.name = null;
            let book_resp = await api_post({url: url, payload: books_payload});
            expect(book_resp.status_code).to.equal(400, "Book was not created");
            expect(book_resp.data).to.equal("'name' is required");
        });

        it('if the name is empty', async function () {
            books_payload.name = "";
            let book_resp = await api_post({url: url, payload: books_payload});
            expect(book_resp.status_code).to.equal(400, "Book was not created");
            expect(book_resp.data).to.equal("'name' is required");
        });

        it('if the author is not specified', async function () {
            delete books_payload.author;
            let book_resp = await api_post({url: url, payload: books_payload});
            expect(book_resp.status_code).to.equal(400, "Book was not created");
            expect(book_resp.data).to.equal("'author' is required");
        });

        it('if the author is null', async function () {
            books_payload.author = null;
            let book_resp = await api_post({url: url, payload: books_payload});
            expect(book_resp.status_code).to.equal(400, "Book was not created");
            expect(book_resp.data).to.equal("'author' is required");
        });

        it('if the author is empty', async function () {
            books_payload.author = "";
            let book_resp = await api_post({url: url, payload: books_payload});
            expect(book_resp.status_code).to.equal(400, "Book was not created");
            expect(book_resp.data).to.equal("'author' is required");
        });
    });
});
