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

describe('Edit reservations', function () {
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

    describe('Edits the reservation', function () {

        it('when the user changes the date', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            let edited_reservation =  Object.assign({}, reservation);
            edited_reservation.reservation_date = dateformat(new Date(Date.now() - 12096e5), "isoDate"); //now - 14 days
            let reservation_id = `${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`;
            await reservations_page
                .navigate()
                .startReservationEdit(reservation_id)
                .updateReservationInfo(edited_reservation);
            await reservations_page
                .getFlashMessageText((result) => {
                    expect(result.value).to.equal("Reservation was saved successfully")
                });
            await reservations_page
                .findReservationInPageById(reservation_id, (result) => {
                    expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                    expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                    expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                    expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                    expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                    expect(result.value).to.not.contain(`${reservation_resp.data.reservation_date}`);
                    expect(result.value).to.contain(`${edited_reservation.reservation_date}`);
                    expect(result.value).to.contain(`${reservation_resp.data.reservation_expiration_date}`);
                })

        });

        it('when the user changes the expiration date', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            let edited_reservation =  Object.assign({}, reservation);
            edited_reservation.reservation_expiration_date = dateformat(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "isoDate"); //now + 7 days
            let reservation_id = `${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`;
            await reservations_page
                .navigate()
                .startReservationEdit(reservation_id)
                .updateReservationInfo(edited_reservation);
            await reservations_page
                .getFlashMessageText((result) => {
                   expect(result.value).to.equal("Reservation was saved successfully")
                });
            await reservations_page
                .findReservationInPageById(reservation_id, (result) => {
                    expect(result.value).to.contain(`${reservation_resp.data.user.first_name}`);
                    expect(result.value).to.contain(`${reservation_resp.data.user.last_name}`);
                    expect(result.value).to.contain(`${reservation_resp.data.user.email}`);
                    expect(result.value).to.contain(`${reservation_resp.data.book.name}`);
                    expect(result.value).to.contain(`${reservation_resp.data.book.author}`);
                    expect(result.value).to.contain(`${reservation_resp.data.reservation_date}`);
                    expect(result.value).to.not.contain(`${reservation_resp.data.reservation_expiration_date}`);
                    expect(result.value).to.contain(`${edited_reservation.reservation_expiration_date}`);
                })

        });
    });


    describe('does not allow', function () {

        it('the change of the user or book', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            let reservation_id = `${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`;
            let edit_reservation_page = reservations_page
                .navigate()
                .startReservationEdit(reservation_id);
            await edit_reservation_page
                .isUserAReadonlyField((result) => {
                    expect(Boolean(result.value), "checking user is readonly").to.be.true;
                })
                .isBookAReadonlyField((result) => {
                    expect(Boolean(result.value), "checking book is readonly").to.be.true;
                });
        });

        it('the removal of the date or expiration date', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            let reservation_id = `${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`;
            let edit_reservation_page = reservations_page
                .navigate()
                .startReservationEdit(reservation_id);
            await edit_reservation_page
                .isDateARequiredField((result) => {
                    expect(Boolean(result.value), "checking date is required").to.be.true;
                });
            await edit_reservation_page
                .clearExpirationDate()
                .tryAndConfirmCreate({expected_result: false});
            let errors = [];
            await edit_reservation_page
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

        it('the expiration date to be lower than the date', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            let edited_reservation =  Object.assign({}, reservation);
            edited_reservation.reservation_expiration_date = dateformat(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "isoDate");
            let reservation_id = `${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`;
            let edit_reservation_page = reservations_page
                .navigate()
                .startReservationEdit(reservation_id);
            await edit_reservation_page
                .isDateARequiredField((result) => {
                    expect(Boolean(result.value), "checking date is required").to.be.true;
                });
            await edit_reservation_page
                .updateReservationInfo(edited_reservation, false)
                .tryAndConfirmCreate({expected_result: false});
            let errors = [];
            await edit_reservation_page
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
    });

    describe('does not edit the reservation', function () {

        it('when the process is canceled', async function () {
            let reservations_page = client.page.viewAllReservationsPage();
            let edited_reservation =  Object.assign({}, reservation);
            edited_reservation.reservation_date = dateformat(new Date(Date.now() - 12096e5), "isoDate"); //now - 14 days
            let reservation_id = `${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`;
            let  edit_reservation_page = reservations_page
                .navigate()
                .startReservationEdit(reservation_id)
                .updateReservationInfo(edited_reservation, false);
            reservations_page = edit_reservation_page
                .cancelEdit();
            await reservations_page
                .findReservationInPageById(reservation_id, (result) => {
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
});