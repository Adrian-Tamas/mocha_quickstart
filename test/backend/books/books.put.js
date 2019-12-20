const book = require("../../../models/book");
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect =  chai.expect;
const api_post = require("../../../actions/backend/api_post");
const api_put = require("../../../actions/backend/api_put");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('Edit Books Endpoint', function() {
    let created_books = [];
    let url, books_payload, book_resp, edited_book_payload;

    beforeEach(async () => {
        url = global.backend_url + "/books";
        books_payload = book();
        book_resp = await api_post({url: url, payload: books_payload});
        created_books.push(book_resp.data.id);
        edited_book_payload = Object.assign({}, books_payload);
    });

    after(async () => {
        for (const entry of created_books) {
            let url = global.backend_url + `/books/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('updates the book details', function () {
        it('when editing the name', async function () {
            edited_book_payload.name = "Edited Name";
            url = url + `/${book_resp.data.id}`;
            let edited_book_resp = await api_put({url: url, payload: edited_book_payload});
            expect(edited_book_resp.status_code).to.equal(200, "Book was updated");
            expect(edited_book_resp.data).excluding("id").to.deep.equal(edited_book_payload, "Content was updated successfully");
        });

        it('when editing the author', async function () {
            edited_book_payload.author = "New Author Name";
            url = url + `/${book_resp.data.id}`;
            let edited_book_resp = await api_put({url: url, payload: edited_book_payload});
            expect(edited_book_resp.status_code).to.equal(200, "Book was updated");
            expect(edited_book_resp.data).excluding("id").to.deep.equal(edited_book_payload, "Content was updated successfully");
        });

        it('when editing the description', async function () {
            edited_book_payload.description = "New description";
            url = url + `/${book_resp.data.id}`;
            let edited_book_resp = await api_put({url: url, payload: edited_book_payload});
            expect(edited_book_resp.status_code).to.equal(200, "Book was updated");
            expect(edited_book_resp.data).excluding("id").to.deep.equal(edited_book_payload, "Content was updated successfully");
        });

        it('when removing the description', async function () {
            delete edited_book_payload.description;
            url = url + `/${book_resp.data.id}`;
            let edited_book_resp = await api_put({url: url, payload: edited_book_payload});
            expect(edited_book_resp.status_code).to.equal(200, "Book was updated");
            expect(edited_book_resp.data).excluding(["id", "description"]).to.deep.equal(edited_book_payload, "Content was updated successfully");
            expect(edited_book_resp.data.description).to.be.null;
        });

        it('when editing the cover', async function () {
            edited_book_payload.cover = "http://newurl.com";
            url = url + `/${book_resp.data.id}`;
            let edited_book_resp = await api_put({url: url, payload: edited_book_payload});
            expect(edited_book_resp.status_code).to.equal(200, "Book was updated");
            expect(edited_book_resp.data).excluding("id").to.deep.equal(edited_book_payload, "Content was updated successfully");
        });

        it('when removing the cover', async function () {
            delete edited_book_payload.cover;
            url = url + `/${book_resp.data.id}`;
            let edited_book_resp = await api_put({url: url, payload: edited_book_payload});
            expect(edited_book_resp.status_code).to.equal(200, "Book was updated");
            expect(edited_book_resp.data).excluding(["id", "cover"]).to.deep.equal(edited_book_payload, "Content was updated successfully");
            expect(edited_book_resp.data.cover).to.be.null;
        });
    });

    describe('ignores', function () {
        it('the id', async function () {
            edited_book_payload.id = "123";
            url = url + `/${book_resp.data.id}`;
            let edited_book_resp = await api_put({url: url, payload: edited_book_payload});
            expect(edited_book_resp.status_code).to.equal(200, "Book was updated");
            expect(edited_book_resp.data).to.deep.equal(book_resp.data, "Content was updated successfully");
        });

        it('extra values', async function () {
            edited_book_payload.extra_value = "extra_value";
            url = url + `/${book_resp.data.id}`;
            let edited_book_resp = await api_put({url: url, payload: edited_book_payload});
            expect(edited_book_resp.status_code).to.equal(200, "Book was updated");
            expect(edited_book_resp.data).to.deep.equal(book_resp.data, "Content was updated successfully");
            expect(edited_book_resp.data).to.not.have.own.property("extra_value");
        });
    });

    describe('fails when trying to', function () {
        it('change the title to an existing one for the author', async function () {
            let second_book_payload = book({author: books_payload.author});
            let second_book_resp = await api_post({url: url, payload:second_book_payload});
            edited_book_payload.name = second_book_payload.name;
            url = url + `/${book_resp.data.id}`;
            let edited_book_resp = await api_put({url: url, payload: edited_book_payload});
            expect(edited_book_resp.status_code).to.equal(400, "Book was not updated");
            expect(edited_book_resp.data).to.equal(`Book with name: ${second_book_payload.name} written by author: ${second_book_payload.author} already exists`);
            created_books.push(second_book_resp.data.id);
        });

        it('change the author and the title matches an existing one for that author', async function () {
            let second_book_payload = book({name: books_payload.name});
            let second_book_resp = await api_post({url: url, payload:second_book_payload});
            edited_book_payload.author = second_book_payload.author;
            url = url + `/${book_resp.data.id}`;
            let edited_book_resp = await api_put({url: url, payload: edited_book_payload});
            expect(edited_book_resp.status_code).to.equal(400, "Book was not updated");
            expect(edited_book_resp.data).to.equal(`Book with name: ${second_book_payload.name} written by author: ${second_book_payload.author} already exists`);
            created_books.push(second_book_resp.data.id);
        });

        it('remove the title', async function () {
            delete edited_book_payload.name;
            url = url + `/${book_resp.data.id}`;
            let edited_book_resp = await api_put({url: url, payload: edited_book_payload});
            expect(edited_book_resp.status_code).to.equal(400, "Book was not updated");
            expect(edited_book_resp.data).to.equal("'name' is required");
        });

        it('remove the author', async function () {
            delete edited_book_payload.author;
            url = url + `/${book_resp.data.id}`;
            let edited_book_resp = await api_put({url: url, payload: edited_book_payload});
            expect(edited_book_resp.status_code).to.equal(400, "Book was not updated");
            expect(edited_book_resp.data).to.equal("'author' is required");
        });
    });
});
