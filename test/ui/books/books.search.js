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
    let created_books = [];

    this.timeout(60000);
    before(async () => {
        await startWebDriver({ env: process.env.NIGHTWATCH_ENV || 'firefox' });
        await createSession({ env: process.env.NIGHTWATCH_ENV || 'firefox' });
    });

    after(async () => {
        await closeSession();
        await stopWebDriver();
        for (const entry of created_books) {
            let url = global.backend_url + `/books/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('filters books', function () {

        it('by full book name', async function () {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            const books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search(book_resp.data.name)
                .getNumberOfDisplayedRows(function (result) {
                    expect(result.value.length).to.be.below(5)
                })
                .findBookInPageById(book_resp.data.id, function (result) {
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                    expect(result.value).to.contain(`${book_resp.data.author}`);
                });
        });

        it('by partial book name', async function () {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            const books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search(book_resp.data.name.substring(5,15))
                .getNumberOfDisplayedRows(function (result) {
                    expect(result.value.length).to.be.below(10)
                })
                .findBookInPageById(book_resp.data.id, function (result) {
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                    expect(result.value).to.contain(`${book_resp.data.author}`);
                })
        });

        it('by author', async function () {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            const books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search(book_resp.data.author)
                .getNumberOfDisplayedRows(function (result) {
                    expect(result.value.length).to.be.below(10)
                })
                .findBookInPageById(book_resp.data.id, function (result) {
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                    expect(result.value).to.contain(`${book_resp.data.author}`);
                })
        });

        it('by partial author name', async function () {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            const books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search(book_resp.data.author.substring(0, 5))
                .getNumberOfDisplayedRows(function (result) {
                    expect(result.value.length).to.be.below(10)
                })
                .findBookInPageById(book_resp.data.id, function (result) {
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                    expect(result.value).to.contain(`${book_resp.data.author}`);
                })
        });
    });

    describe('displays an empty table', function () {
        it('when none of the entries match the search criteria', async function () {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            const books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search("aaaaaaaaaaaaaaaaaa")
                .getNumberOfDisplayedRows(function (result) {
                    expect(result.value.length).to.be.equals(0)
                })
        });
    });
});