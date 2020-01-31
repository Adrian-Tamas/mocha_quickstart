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
            books_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${book_resp.data.cover}`);
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${books_payload.name}`);
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.author}`);
                })
                .getDescription((result) => {
                    expect(result.value).to.contain(`${book_resp.data.description}`);
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
            books_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${book_resp.data.cover}`);
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${books_payload.author}`);
                })
                .getDescription((result) => {
                    expect(result.value).to.contain(`${book_resp.data.description}`);
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
            books_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${book_resp.data.cover}`);
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.author}`);
                })
                .getDescription((result) => {
                    expect(result.value).to.contain(`${books_payload.description}`);
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
            books_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${books_payload.cover}`);
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.author}`);
                })
                .getDescription((result) => {
                    expect(result.value).to.contain(`${book_resp.data.description}`);
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
            books_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${books_payload.cover}`);
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.author}`);
                })
                .getDescription((result) => {
                    expect(result.value).to.contain("No description provided");
                })
        });

        it('when the user removes the cover', async () => {
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
            books_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain("/static/no_cover.gif");
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.author}`);
                })
                .getDescription((result) => {
                    expect(result.value).to.contain(`${book_resp.data.description}`);
                })
        });

        it('when the user adds a book with different name for an existing author', async () => {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            let second_books_payload = book();
            let second_book_resp = await api_post({url: url, payload: second_books_payload});
            created_books.push(book_resp.data.id);
            created_books.push(second_book_resp.data.id);
            books_payload.author = second_books_payload.author;
            let books_page = client.page.viewAllBooksPage();
            let edit_book_page = books_page
                .navigate()
                .search(book_resp.data.name)
                .startBookEdit(book_resp.data.id);
            books_page = edit_book_page.updateBookInfo(books_payload);
            books_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            books_page.search(book_resp.data.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${book_resp.data.cover}`);
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${books_payload.author}`);
                    expect(result.value).to.contain(`${second_books_payload.author}`);
                })
                .getDescription((result) => {
                    expect(result.value).to.contain(`${book_resp.data.description}`);
                })
        });

        it('when the user adds a book with the same name for a different author', async () => {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            let second_books_payload = book();
            let second_book_resp = await api_post({url: url, payload: second_books_payload});
            created_books.push(book_resp.data.id);
            created_books.push(second_book_resp.data.id);
            books_payload.name = second_books_payload.name;
            let books_page = client.page.viewAllBooksPage();
            let edit_book_page = books_page
                .navigate()
                .search(book_resp.data.name)
                .startBookEdit(book_resp.data.id);
            books_page = edit_book_page.updateBookInfo(books_payload);
            books_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            await books_page.search(books_payload.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${book_resp.data.cover}`);
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${books_payload.name}`);
                    expect(result.value).to.contain(`${second_books_payload.name}`);
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${books_payload.author}`);
                })
                .getDescription((result) => {
                    expect(result.value).to.contain(`${book_resp.data.description}`);
                })
        });
    });

    describe('does not allow user to', function () {

        it('remove the book name or author', async function() {
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
            await edit_book_page.isNameARequiredField((result) => {
                expect(Boolean(result.value), "checking name is required").to.be.true;
            });
            await edit_book_page.isAuthorARequiredField((result) => {
                expect(Boolean(result.value), "checking author is required").to.be.true;
            })
        });

        it('change the name of the book to one that already exists for the author', async () => {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            let second_books_payload = book();
            second_books_payload.author = books_payload.author;
            let second_book_resp = await api_post({url: url, payload: second_books_payload});
            created_books.push(book_resp.data.id);
            created_books.push(second_book_resp.data.id);
            books_payload.name = second_books_payload.name;
            let books_page = client.page.viewAllBooksPage();
            let edit_book_page = books_page
                .navigate()
                .search(book_resp.data.name)
                .startBookEdit(book_resp.data.id);
            edit_book_page.updateBookInfo(books_payload);
            await edit_book_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`There was an error saving the book because "Book with name: ${books_payload.name} written by author: ${books_payload.author} already exists"`);
            });
        });
    });

    describe('does not edit the book', function () {
        it('when the process is canceled', async () => {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let book_resp = await api_post({url: url, payload: books_payload});
            created_books.push(book_resp.data.id);
            books_payload.author = `${faker.name.firstName()} ${faker.name.lastName()}`;
            books_payload.name = faker.lorem.words(5);
            let books_page = client.page.viewAllBooksPage();
            let edit_book_page = books_page
                .navigate()
                .search(book_resp.data.name)
                .startBookEdit(book_resp.data.id);
            edit_book_page.updateBookInfo(books_payload, false);
            books_page = edit_book_page.cancelEdit();
            await books_page.search(books_payload.name)
                .openBookDetails(book_resp.data.id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${books_payload.cover}`);
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${book_resp.data.author}`);
                })
                .getDescription((result) => {
                    expect(result.value).to.contain(`${book_resp.data.description}`);
                })
        });
    });
});