const book = require("../../../models/book");
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect =  chai.expect;
const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('Delete Books Endpoint', function() {
    let url;

    beforeEach(async () => {
        url = global.backend_url + "/books";

    });

    describe('removes a book', function () {
        it('if the request is correct', async function () {
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            url = url + `/${book_resp.data.id}`;
            let del_resp = await api_delete({url: url});
            expect(del_resp.status_code).to.equal(200, "Book was deleted");
            expect(del_resp.data).to.equal(`Successfully deleted book ${book_resp.data.id}`);
        });
    });

    describe('fails if the delete request is done', function () {
        it('on the wrong id', async function () {
            url = url + "/123";
            let del_resp = await api_delete({url: url});
            expect(del_resp.status_code).to.equal(400, "Book can't be deleted");
            expect(del_resp.data).to.equal("Book with id = 123 was not found");
        });
    });
});
