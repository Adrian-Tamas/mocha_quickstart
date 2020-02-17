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

describe('View book details modal', function () {
    let created_books = [];

    this.timeout(60000);
    before(async () => {
        await createSession({env: process.env.NIGHTWATCH_ENV || 'firefox'});
    });

    after(async () => {
        await closeSession();
        for (const entry of created_books) {
            let url = global.backend_url + `/books/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('displays all the details', function () {

        it('when the user opens it', async function () {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            const books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${book_resp.data.cover}`)
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.name}`)
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.author}`)
                })
                .getDescription((result) => {
                    expect(result.value).to.contain(`${book_resp.data.description}`)
                })
        });
    });

    describe('displays default values', function () {
        it('when cover and descriptions are not added', async function () {
            let url = global.backend_url + "/books";
            let books_payload = book();
            delete books_payload.description;
            delete books_payload.cover;
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            const books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain("/static/no_cover.gif")
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.name}`)
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.author}`)
                })
                .getDescription((result) => {
                    expect(result.value).to.contain("No description provided")
                })
        });
    });

    describe('closes the modal', function () {
        it('when the cancel button is clicked', async function () {
            let url = global.backend_url + "/books";
            let books_payload = book();
            delete books_payload.cover;
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            const books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .closeModalFromCancelButton();
            await books_page
                .section
                .detailsModal
                .waitForElementNotVisible("@modal", 30000);
        });

        it('when the x button is clicked', async function () {
            let url = global.backend_url + "/books";
            let books_payload = book();
            delete books_payload.cover;
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            const books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search(book_resp.data.name);
            await books_page
                .removeFade();
            await books_page
                .openBookDetails(book_resp.data.id);
            await books_page
                .closeModalFromXButton();
            await books_page
                .section
                .detailsModal
                .waitForElementNotVisible("@modal", 30000);
        });
    });
});