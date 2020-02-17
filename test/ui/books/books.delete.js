const {
    client,
    createSession,
    closeSession,
    startWebDriver,
    stopWebDriver,
    getNewScreenshots
} = require('nightwatch-api');
const book = require("../../../models/book");
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect =  chai.expect;
const faker = require("faker");

const api_get = require("../../../actions/backend/api_get");
const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('Delete book', function () {
    let created_books = [];
    let books_payload;
    let book_resp;

    this.timeout(60000);
    before(async () => {
        await createSession({env: process.env.NIGHTWATCH_ENV || 'firefox'});
    });

    beforeEach(async () => {
        let url = global.backend_url + "/books";
        books_payload = book();
        book_resp = await api_post({url: url, payload: books_payload});
        created_books.push(book_resp.data.id);
    });

    after(async () => {
        await closeSession();
        for (const entry of created_books) {
            let url = global.backend_url + `/books/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('removes the book', function () {

        it('when the user chooses to confirm the delete modal', async function() {
            let books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search(book_resp.data.name)
                .openBookDeleteModal(book_resp.data.id);
            await books_page
                .section
                .deleteModal
                .getMessageText((result) => {
                    expect(result.value).to.equal("Are you sure you want to delete the selected Book?");
                });
            await books_page
                .confirmBookDelete();
            await books_page
                .getFlashMessageText((result) => {
                    expect(result.value).to.equal(`Book with id: ${book_resp.data.id} has been successfully deleted!`);
                });
            await books_page
                .search(books_payload.name)
                .getNumberOfDisplayedRows((result) => {
                    expect(result.value).to.have.length(0);
                });
        });
    });

    describe('does not remove the book', function () {

        it('when the user chooses to cancel the delete modal', async function() {
            let books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search(book_resp.data.name)
                .openBookDeleteModal(book_resp.data.id);
            await books_page
                .section
                .deleteModal
                .getMessageText((result) => {
                    expect(result.value).to.equal("Are you sure you want to delete the selected Book?");
                });
            await books_page
                .cancelBookDelete();
            await books_page
                .search(books_payload.name)
                .getNumberOfDisplayedRows((result) => {
                    expect(result.value).to.have.length(1);
                });
        });

        it('when the user chooses to close the delete modal', async function() {
            let books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search(book_resp.data.name)
                .openBookDeleteModal(book_resp.data.id);
            await books_page
                .section
                .deleteModal
                .getMessageText((result) => {
                    expect(result.value).to.equal("Are you sure you want to delete the selected Book?");
                });
            await books_page
                .closeBookDelete();
            await books_page
                .search(books_payload.name)
                .getNumberOfDisplayedRows((result) => {
                    expect(result.value).to.have.length(1);
                });
        });
    });
});