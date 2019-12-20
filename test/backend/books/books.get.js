const book = require("../../../models/book");
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect =  chai.expect;
const api_get = require("../../../actions/backend/api_get");
const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('Get Books Endpoint', function() {
    let created_books = [];
    let url, books_payload, book_resp;

    beforeEach(async () => {
        url = global.backend_url + "/books";
        books_payload = book();
        book_resp = await api_post({url: url, payload: books_payload});
        created_books.push(book_resp.data.id);
    });

    after(async () => {
        for (const entry of created_books) {
            let url = global.backend_url + `/books/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('returns', function () {
        it('all books', async function () {
            let resp = await api_get({url: url});
            expect(resp.status_code).to.equal(200, "Request was successful");
            expect(resp.data).to.have.lengthOf.above(0);
        });

        it('one when requested', async function () {
            url = url + `/${book_resp.data.id}`;
            let resp = await api_get({url: url});
            expect(resp.status_code).to.equal(200, "Request was successful");
            expect(resp.data).excluding("id").to.deep.equal(books_payload, "Book was returned correctly");
            expect(resp.data.id).to.equal(book_resp.data.id)
        });
    });

    describe('fails', function () {
        it('when requesting book by incorrect id', async function () {
            url = url + `/123`;
            let resp = await api_get({url: url});
            expect(resp.status_code).to.equal(400, "Request failed");
            expect(resp.data).to.equal("Book with id = 123 was not found");
        });
    });
});
