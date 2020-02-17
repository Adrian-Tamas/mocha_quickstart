const {
    client,
    createSession,
    closeSession,
    startWebDriver,
    stopWebDriver,
    getNewScreenshots
} = require('nightwatch-api');
const dateformat = require("dateformat");
const user = require("../../../models/user");
const book = require("../../../models/book");
const reservation_payload = require("../../../models/reservations_payload");
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect = chai.expect;

const api_get = require("../../../actions/backend/api_get");
const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('View reservations', function () {
    this.timeout(60000);
    let created_books = [];
    let created_users = [];
    let created_reservations = [];
    let user_resp, book_resp, reservation, reservation_resp;

    before(async () => {
        await createSession({env: process.env.NIGHTWATCH_ENV || 'firefox'});
    });

    beforeEach(async () => {
        let book_payload = book();
        let user_payload = user();
        user_resp = await api_post({url: global.backend_url + "/users", payload: user_payload});
        book_resp = await api_post({url: global.backend_url + "/books", payload: book_payload});
        created_users.push(user_resp.data.id);
        created_books.push(book_resp.data.id);
        reservation = reservation_payload({book_id: book_resp.data.id,
            user_id: user_resp.data.id,
            reservation_date: dateformat(Date.now(), "isoDate"),
            reservation_expiration_date: dateformat(new Date(Date.now() + 12096e5), "isoDate")}); // now + 14 days in ms
        reservation_resp = await api_post({url: global.backend_url + "/reservations", payload: reservation});
        expect(reservation_resp.status_code).to.equal(200, "Reservation was created");
        created_reservations.push(reservation_resp.data.user.id);
    });

    after(async () => {
        await closeSession();
        for (const entry of created_reservations) {
            let url = global.backend_url + `/reservations/user/${entry}`;
            await api_delete({url: url});
        }
        for (const entry of created_users) {
            let url = global.backend_url + `/users/${entry}`;
            await api_delete({url: url});

        }
        for (const entry of created_books) {
            let url = global.backend_url + `/books/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('filters reservations', function () {

        it('when searching by user first name', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            await reservations_page
                .navigate()
                .search(`${user_resp.data.first_name}`);
            await reservations_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.be.below(10);
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let rowElementId = row[Object.keys(row)[0]];
                        client.elementIdText(rowElementId, function (result) {
                            expect(result.value.toLowerCase()).to.contain(`${user_resp.data.first_name}`.toLowerCase())
                        });
                    });
                });
            await reservations_page
                .findReservationInPageById(`${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`, (result) => {
                        expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_date}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_expiration_date}`);
                    })
        });

        it('when searching by partial user first name', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            const search_term = `${user_resp.data.first_name}`.substring(0, 5).toLowerCase();
            await reservations_page
                .navigate()
                .search(search_term);
            await reservations_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.be.below(10);
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let rowElementId = row[Object.keys(row)[0]];
                        client.elementIdText(rowElementId, function (result) {
                            expect(result.value.toLowerCase()).to.contain(search_term)
                        });
                    });
                });
            await reservations_page
                .findReservationInPageById(`${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`, (result) => {
                        expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_date}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_expiration_date}`);
                    })
        });

        it('when searching by user last name', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            await reservations_page
                .navigate()
                .search(`${user_resp.data.last_name}`);
            await reservations_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.be.below(10);
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let rowElementId = row[Object.keys(row)[0]];
                        client.elementIdText(rowElementId, function (result) {
                            expect(result.value.toLowerCase()).to.contain(`${user_resp.data.last_name}`.toLowerCase())
                        });
                    });
                });
            await reservations_page
                .findReservationInPageById(`${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`, (result) => {
                        expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_date}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_expiration_date}`);
                    })
        });

        it('when searching by partial user last name', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            const search_term = `${user_resp.data.last_name}`.substring(0, 5).toLowerCase();
            await reservations_page
                .navigate()
                .search(search_term);
            await reservations_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.be.below(10);
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let rowElementId = row[Object.keys(row)[0]];
                        client.elementIdText(rowElementId, function (result) {
                            expect(result.value.toLowerCase()).to.contain(search_term)
                        });
                    });
                });
            await reservations_page
                .findReservationInPageById(`${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`, (result) => {
                        expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_date}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_expiration_date}`);
                    })
        });

        it('when searching by user email', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            await reservations_page
                .navigate()
                .search(`${user_resp.data.email}`);
            await reservations_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.be.below(10);
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let rowElementId = row[Object.keys(row)[0]];
                        client.elementIdText(rowElementId, function (result) {
                            expect(result.value.toLowerCase()).to.contain(`${user_resp.data.email}`.toLowerCase())
                        });
                    });
                });
            await reservations_page
                .findReservationInPageById(`${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`, (result) => {
                        expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_date}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_expiration_date}`);
                    })
        });

        it('when searching by partial user email', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            const search_term = `${user_resp.data.email}`.substring(0, 5).toLowerCase();
            await reservations_page
                .navigate()
                .search(search_term);
            await reservations_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.be.below(10);
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let rowElementId = row[Object.keys(row)[0]];
                        client.elementIdText(rowElementId, function (result) {
                            expect(result.value.toLowerCase()).to.contain(search_term)
                        });
                    });
                });
            await reservations_page
                .findReservationInPageById(`${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`, (result) => {
                        expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_date}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_expiration_date}`);
                    })
        });

        it('when searching by book author', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            await reservations_page
                .navigate()
                .search(`${book_resp.data.author}`);
            await reservations_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.be.below(10);
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let rowElementId = row[Object.keys(row)[0]];
                        client.elementIdText(rowElementId, function (result) {
                            expect(result.value.toLowerCase()).to.contain(`${book_resp.data.author}`.toLowerCase())
                        });
                    });
                });
            await reservations_page
                .findReservationInPageById(`${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`, (result) => {
                        expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_date}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_expiration_date}`);
                    })
        });

        it('when searching by partial book author name', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            const search_term = `${book_resp.data.author}`.substring(0, 5).toLowerCase();
            await reservations_page
                .navigate()
                .search(search_term);
            await reservations_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.be.below(10);
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let rowElementId = row[Object.keys(row)[0]];
                        client.elementIdText(rowElementId, function (result) {
                            expect(result.value.toLowerCase()).to.contain(search_term)
                        });
                    });
                });
            await reservations_page
                .findReservationInPageById(`${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`, (result) => {
                        expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_date}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_expiration_date}`);
                    })
        });

        it('when searching by book name', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            await reservations_page
                .navigate()
                .search(`${book_resp.data.name}`);
            await reservations_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.be.below(10);
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let rowElementId = row[Object.keys(row)[0]];
                        client.elementIdText(rowElementId, function (result) {
                            expect(result.value.toLowerCase()).to.contain(`${book_resp.data.name}`.toLowerCase())
                        });
                    });
                });
            await reservations_page
                .findReservationInPageById(`${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`, (result) => {
                        expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_date}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_expiration_date}`);
                    })
        });

        it('when searching by partial book name', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            const search_term = `${book_resp.data.name}`.substring(0, 5).toLowerCase();
            await reservations_page
                .navigate()
                .search(search_term);
            await reservations_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.be.below(10);
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let rowElementId = row[Object.keys(row)[0]];
                        client.elementIdText(rowElementId, function (result) {
                            expect(result.value.toLowerCase()).to.contain(search_term)
                        });
                    });
                });
            await reservations_page
                .findReservationInPageById(`${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`, (result) => {
                        expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_date}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_expiration_date}`);
                    })
        });

        it('when searching by reservation date', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            let url = global.backend_url + "/reservations";
            let reservations_resp = await api_get({url: url});
            await reservations_page
                .navigate()
                .search(`${reservation_resp.data.reservation_date}`);
            await reservations_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.be.below(reservations_resp.data.length);
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let rowElementId = row[Object.keys(row)[0]];
                        client.elementIdText(rowElementId, function (result) {
                            expect(result.value.toLowerCase()).to.contain(`${reservation_resp.data.reservation_date}`.toLowerCase())
                        });
                    });
                });
            await reservations_page
                .findReservationInPageById(`${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`, (result) => {
                        expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                        expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_date}`);
                        expect(result.value).to.contain(`${reservation_resp.data.reservation_expiration_date}`);
                    })
        });
    });

    describe('shows an empty table', function () {

        it('when the search term does not match anything', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            await reservations_page
                .navigate()
                .search("aaaaaaaaaaaaaa");
            await reservations_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.equal(0);
                });
        });
    });
});
