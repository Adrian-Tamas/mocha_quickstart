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

describe('Create reservations', function () {
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
            reservation_date: new Date(Date.now()).toISOString().slice(0,10),
            reservation_expiration_date: new Date(Date.now() + 12096e5).toISOString().slice(0,10)}); // now + 14 days in ms
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

    describe('creates the reservation', function () {

        it('when the required fields are set', async function () {
            let reservations_page = client.page.viewAllReservationsPage();
            let create_reservation_page = reservations_page
                .navigate()
                .startCreateReservation();
            reservations_page = create_reservation_page
                .createReservation(reservation);
            await reservations_page.getFlashMessageText((result) => {
                expect(result.value).to.equal("Reservation was successfully saved");
            });
            created_reservations.push(reservation.user_id);
            await reservations_page
                .findReservationInPageById(`${reservation.user_id}_${reservation.book_id}`, (result) => {
                    expect(result.value).to.contain(`${user_resp.data.first_name}`);
                    expect(result.value).to.contain(`${user_resp.data.last_name}`);
                    expect(result.value).to.contain(`${user_resp.data.email}`);
                    expect(result.value).to.contain(`${book_resp.data.name}`);
                    expect(result.value).to.contain(`${book_resp.data.author}`);
                    expect(result.value).to.contain(`${reservation.reservation_date}`);
                    expect(result.value).to.contain(`${reservation.reservation_expiration_date}`);
                })
        });

        it('all users are present in the user dropdown', async function () {
            let all_users = await api_get({url: global.backend_url + "/users"});
            let all_users_ids = all_users.data.map(user => user.id);
            let reservations_page = client.page.viewAllReservationsPage();
            let create_reservation_page = reservations_page
                .navigate()
                .startCreateReservation();
            let user_ids = [];
            await create_reservation_page
                .getAllOptionsForTheUserDropdown((result) => {
                    expect(result.value.length).to.equal(all_users_ids.length);
                    result.value.forEach(function (option) {
                        let optionElementId = option[Object.keys(option)[0]];
                        client.elementIdAttribute(optionElementId, "value", function (result) {
                            user_ids.push(result.value)
                        })
                    });
                });
            expect(user_ids.sort()).to.deep.equal(all_users_ids.sort());
        });

        it('all books that are not already reserved are displayed', async function () {
            let all_books = await api_get({url: global.backend_url + "/books"});
            let all_books_ids = all_books.data.map(book => book.id);
            let all_reservations = await api_get({url: global.backend_url + "/reservations"});
            let all_reserved_book_ids = all_reservations.data.map(r => r.book.id);
            let not_reserved_book_ids = all_books_ids.filter(id => !all_reserved_book_ids.includes(id));
            let reservations_page = client.page.viewAllReservationsPage();
            let create_reservation_page = reservations_page
                .navigate()
                .startCreateReservation();
            let book_ids = [];
            await create_reservation_page
                .getAllOptionsForTheBookDropdown((result) => {
                    expect(result.value.length).to.equal(not_reserved_book_ids.length);
                    result.value.forEach(function (option) {
                        let optionElementId = option[Object.keys(option)[0]];
                        client.elementIdAttribute(optionElementId, "value", function (result) {
                            book_ids.push(result.value)
                        })
                    });
                });
            expect(book_ids.sort()).to.deep.equal(not_reserved_book_ids.sort());
        });
    });

    describe('does not allow reservations to be created', function () {

        it('when the user does not specify the required information', async function () {
            let reservations_page = client.page.viewAllReservationsPage();
            let create_reservation_page = reservations_page
                .navigate()
                .startCreateReservation();
            await create_reservation_page.isUserARequiredField((result) => {
                expect(Boolean(result.value), "checking user is required").to.be.true;
            });
            await create_reservation_page.isBookARequiredField((result) => {
                expect(Boolean(result.value), "checking book is required").to.be.true;
            });
            await create_reservation_page.isReservationDateARequiredField((result) => {
                expect(Boolean(result.value), "checking reservation date is required").to.be.true;
            });
        });

        it('when the expiration date is not set', async function () {
            let reservations_page = client.page.viewAllReservationsPage();
            reservation.reservation_expiration_date = "";
            const create_reservation_page = reservations_page
                .navigate()
                .startCreateReservation();
            await create_reservation_page
                .createReservation(reservation, false)
                .tryAndConfirmCreate(false);
            await create_reservation_page
                .getFlashMessageText((result) => {
                    expect(result.value).to.equal("There was an error saving the reservation");
                });
            let errors = [];
            await create_reservation_page
                .getFieldErrorsMessage(function (res) {
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let errorElementId = row[Object.keys(row)[0]];
                        client.elementIdText(errorElementId, function (result) {
                            errors.push(result.value)
                        })
                    });
                });
            expect(errors.length).to.equal(2);
            expect(errors).to.contain("Invalid value for field Reservation Expiration Date");
            expect(errors).to.contain("Not a valid date value");
        });

        it('when the expiration date is before the reservation date', async function () {
            let reservations_page = client.page.viewAllReservationsPage();
            reservation.reservation_expiration_date = new Date(Date.now() - 12096e5).toISOString().slice(0,10); //now - 14 days
            const create_reservation_page = reservations_page
                .navigate()
                .startCreateReservation();
            await create_reservation_page
                .createReservation(reservation, false)
                .tryAndConfirmCreate(false);
            await create_reservation_page
                .getFlashMessageText((result) => {
                    expect(result.value).to.equal("There was an error saving the reservation");
                });
            let errors = [];
            await create_reservation_page
                .getFieldErrorsMessage(function (res) {
                    expect(res.value.length).to.not.equal(0);
                    res.value.forEach(function (row) {
                        let errorElementId = row[Object.keys(row)[0]];
                        client.elementIdText(errorElementId, function (result) {
                            errors.push(result.value)
                        })
                    });
                });
            expect(errors.length).to.equal(1);
            expect(errors[0]).to.contain("Reservation Expiration Date should be greater than Reservation Date");
        });

        it('when the expiration date is before the reservation date', async function () {
            let reservations_page = client.page.viewAllReservationsPage();
            let create_reservation_page = reservations_page
                .navigate()
                .startCreateReservation();
            reservations_page = create_reservation_page
                .createReservation(reservation, false)
                .cancelCreate();
            await reservations_page
                .getDisplayedRows((res) => {
                    res.value.forEach((row) => {
                        let rowElementId = row[Object.keys(row)[0]];
                        client.elementIdText(rowElementId, function (result) {
                            expect(result.value).to.satisfy(string =>
                                [user_resp.data.first_name,
                                    user_resp.data.last_name,
                                    user_resp.data.email,
                                    book_resp.data.name,
                                    book_resp.data.author].every(bit => !string.includes(bit))
                            );
                        });
                    })
                })
        });
    });
});
