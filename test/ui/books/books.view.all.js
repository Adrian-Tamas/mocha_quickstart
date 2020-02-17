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

const api_get = require("../../../actions/backend/api_get");
const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('View all books page', function () {
    this.timeout(60000);
    let created_books = [];

    before(async () => {
        await createSession({ env: process.env.NIGHTWATCH_ENV || 'firefox' });
    });

    after(async () => {
        await closeSession();
        for (const entry of created_books) {
            let url = global.backend_url + `/books/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('displays', function () {
        it('all books in a table', async function () {
            let url = global.backend_url + "/books";
            let resp = await api_get({url: url});
            const books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .waitForElementPresent("@table", 10000)
                .api.elements("@tableRow", function (result) {
                    expect(result.value.length).to.be.equal(resp.data.length);
                })
        });

        it('displays the book name and author', async function () {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            const books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .findBookInPageById(book_resp.data.id, function (result) {
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                    expect(result.value).to.contain(`${book_resp.data.author}`);
                })
        });
    });
});