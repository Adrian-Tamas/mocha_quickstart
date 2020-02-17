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

const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('Create books', function () {
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

    describe('creates a new book', function () {

        it('when all values are given', async function () {
            let books_payload = book();
            let books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .startCreateBook()
                .createBook(books_payload);
            await books_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            let book_id;
            await books_page.getBookId(books_payload.name, (result) => {
                book_id = result.value;});
            created_books.push(book_id);
            await books_page
                .openBookDetails(book_id);
            await books_page
                .section
                .detailsModal
                .getCoverUrl((result) => {
                    expect(result.value).to.contain(`${books_payload.cover}`);
                })
                .getBookName((result) => {
                    expect(result.value).to.contain(`${books_payload.name}`);
                })
                .getAuthorName((result) => {
                    expect(result.value).to.contain(`${books_payload.author}`);
                })
                .getDescription((result) => {
                    expect(result.value).to.contain(`${books_payload.description}`);
                });
        });

        it('when only the mandatory values are given', async function () {
            let books_payload = book({description: "", cover: ""});
            let books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .search(books_payload.name)
                .startCreateBook()
                .createBook(books_payload);
            await books_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            let book_id;
            await books_page.getBookId(books_payload.name, (result) => {
                book_id = result.value
                created_books.push(book_id);
            });
            await books_page
                    .openBookDetails(book_id);
            await books_page
                    .section
                    .detailsModal
                    .getCoverUrl((result) => {
                        expect(result.value).to.contain("/static/no_cover.gif");
                    })
                    .getBookName((result) => {
                        expect(result.value).to.contain(`${books_payload.name}`);
                    })
                    .getAuthorName((result) => {
                        expect(result.value).to.contain(`${books_payload.author}`);
                    })
                    .getDescription((result) => {
                        expect(result.value).to.contain("No description provided");
                    });
        });

        it('when when adding one for an existing author', async function () {
            let url = global.backend_url + "/books";
            let books_payload = book();
            let existing_books_payload = book();
            let existing_book_resp = await api_post({url: url, payload: existing_books_payload});
            created_books.push(existing_book_resp.data.id);
            books_payload.author = existing_books_payload.author;
            let books_page = client.page.viewAllBooksPage();
            await books_page
                .navigate()
                .startCreateBook()
                .createBook(books_payload);
            await books_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`Book '${books_payload.name}' was successfully saved`);
            });
            let book_id;
            await books_page.getBookId(books_payload.name, (result) => {
                book_id = result.value;
                created_books.push(book_id);
            });
            await books_page
                    .openBookDetails(book_id);
            await books_page
                    .section
                    .detailsModal
                    .getCoverUrl((result) => {
                        expect(result.value).to.contain(`${books_payload.cover}`);
                    })
                    .getBookName((result) => {
                        expect(result.value).to.contain(`${books_payload.name}`);
                    })
                    .getAuthorName((result) => {
                        expect(result.value).to.contain(`${books_payload.author}`);
                    })
                    .getDescription((result) => {
                        expect(result.value).to.contain(`${books_payload.description}`);
                    });
        });

        describe('dose not create a new book', function () {

            it('when required values are not passed', async function () {
                let books_page = client.page.viewAllBooksPage();
                let create_book_page = books_page
                    .navigate()
                    .startCreateBook();
                await create_book_page.isNameARequiredField((result) => {
                    expect(Boolean(result.value), "checking name is required").to.be.true;
                });
                await create_book_page.isAuthorARequiredField((result) => {
                    expect(Boolean(result.value), "checking author is required").to.be.true;
                })
            });

            it('when adding one for an existing author with the same title', async function () {
                let url = global.backend_url + "/books";
                let books_payload = book();
                let existing_books_payload = book();
                let existing_book_resp = await api_post({url: url, payload: existing_books_payload});
                created_books.push(existing_book_resp.data.id);
                books_payload.author = existing_books_payload.author;
                books_payload.name = existing_books_payload.name;
                let books_page = client.page.viewAllBooksPage();
                let create_book_page = books_page
                    .navigate()
                    .startCreateBook()
                    .createBook(books_payload, false)
                    .tryAndConfirmCreate({expected_result: false});
                await create_book_page.getFlashMessageText((result) => {
                    expect(result.value).to.equal(`There was an error saving the book because "Book with name: ${books_payload.name} written by author: ${books_payload.author} already exists"`);
                });
            });

            it('when adding one with a title shorter than 3 characters', async function () {
                let books_payload = book();
                books_payload.name = "aa";
                let books_page = client.page.viewAllBooksPage();
                let create_book_page = books_page
                    .navigate()
                    .startCreateBook()
                    .createBook(books_payload, false)
                    .tryAndConfirmCreate({expected_result: false});
                await create_book_page.getFlashMessageText((result) => {
                    expect(result.value).to.equal(`An error has occurred! Please fix all errors and try again.`);
                });
                await create_book_page.getFieldErrorMessage((result) => {
                    expect(result.value).to.include(`Field must be at least 3 characters long.`);
                })
            });

            it('when adding one with a author name longer than 30 characters', async function () {
                let books_payload = book();
                books_payload.author = faker.lorem.paragraph(6).substr(0, 40);
                let books_page = client.page.viewAllBooksPage();
                let create_book_page = books_page
                    .navigate()
                    .startCreateBook()
                    .createBook(books_payload, false)
                    .tryAndConfirmCreate({expected_result: false});
                await create_book_page.getFlashMessageText((result) => {
                    expect(result.value).to.equal(`An error has occurred! Please fix all errors and try again.`);
                });
                await create_book_page.getFieldErrorMessage((result) => {
                    expect(result.value).to.include(`Field must be between 3 and 30 characters long.`);
                })
            });

            it('when canceling the book creation process', async function () {
                let books_payload = book();
                let books_page = client.page.viewAllBooksPage();
                await books_page
                    .navigate()
                    .startCreateBook()
                    .createBook(books_payload, false)
                    .cancelCreate();
                await books_page
                    .search(books_payload.name)
                    .getNumberOfDisplayedRows((result) => {
                        expect(result.value).to.have.length(0);
                    });
            });
        });
    });
});
