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

describe('Edit books', function () {
    let created_books = [];

    this.timeout(60000);
    before(async () => {
        await startWebDriver({env: process.env.NIGHTWATCH_ENV || 'firefox'});
        await createSession({env: process.env.NIGHTWATCH_ENV || 'firefox'});
    });

    after(async () => {
        await closeSession();
        await stopWebDriver();
        for (const entry of created_books) {
            let url = global.backend_url + `/books/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('changes the book information', function () {

        it('when the user edits the name', async function() {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            books_payload.name = faker.lorem.words(5);
            let books_page = client.page.viewAllBooksPage();
            let edit_book_page = books_page
                .navigate()
                .search(book_resp.data.name)
                .startBookEdit(book_resp.data.id);
            books_page = edit_book_page.updateBookInfo(books_payload);
            books_page.getSuccessMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${book_resp.data.cover}`)
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${books_payload.name}`)
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.author}`)
                })
                .getDescription((result) => {
                    expect(result.value).to.contain(`${book_resp.data.description}`)
                })
        });

        it('when the user edits the author', async () => {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            books_payload.author = `${faker.name.firstName()} ${faker.name.lastName()}`;
            let books_page = client.page.viewAllBooksPage();
            let edit_book_page = books_page
                .navigate()
                .search(book_resp.data.name)
                .startBookEdit(book_resp.data.id);
            books_page = edit_book_page.updateBookInfo(books_payload);
            books_page.getSuccessMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
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
                    expect(result.value).to.contain(`${books_payload.author}`)
                })
                .getDescription((result) => {
                    expect(result.value).to.contain(`${book_resp.data.description}`)
                })
        });

        it('when the user edits the description', async () => {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            books_payload.description = faker.lorem.paragraph();
            let books_page = client.page.viewAllBooksPage();
            let edit_book_page = books_page
                .navigate()
                .search(book_resp.data.name)
                .startBookEdit(book_resp.data.id);
            books_page = edit_book_page.updateBookInfo(books_payload);
            books_page.getSuccessMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
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
                    expect(result.value).to.contain(`${books_payload.description}`)
                })
        });

        it('when the user edits the cover', async () => {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            books_payload.cover = faker.internet.url();
            let books_page = client.page.viewAllBooksPage();
            let edit_book_page = books_page
                .navigate()
                .search(book_resp.data.name)
                .startBookEdit(book_resp.data.id);
            books_page = edit_book_page.updateBookInfo(books_payload);
            books_page.getSuccessMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${books_payload.cover}`)
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

        it('when the user removes the description', async () => {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            let books_page = client.page.viewAllBooksPage();
            let edit_book_page = books_page
                .navigate()
                .search(book_resp.data.name)
                .startBookEdit(book_resp.data.id);
            books_page = edit_book_page.removeDescription();
            books_page.getSuccessMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${books_payload.cover}`)
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

        it.only('when the user removes the cover', async () => {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            let books_page = client.page.viewAllBooksPage();
            let edit_book_page = books_page
                .navigate()
                .search(book_resp.data.name)
                .startBookEdit(book_resp.data.id);
            books_page = edit_book_page.removeCoverLink();
            books_page.getSuccessMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
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
                    expect(result.value).to.contain(`${book_resp.data.description}`)
                })
        });
    });
});