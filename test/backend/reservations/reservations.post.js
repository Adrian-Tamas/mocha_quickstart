const book = require("../../../models/book");
const user = require("../../../models/user");
const reservation_payload = require("../../../models/reservations_payload");
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect =  chai.expect;
const api_get = require("../../../actions/backend/api_get");
const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('Create Reservation Endpoint', function() {
    let created_books = [];
    let created_users = [];
    let created_reservations = [];
    let url, user_resp, book_resp, reservation;

    beforeEach(async () => {
        url = global.backend_url + "/reservations";
        let book_payload = book();
        let user_payload = user();
        user_resp = await api_post({url: global.backend_url + "/users", payload: user_payload});
        book_resp = await api_post({url: global.backend_url + "/books", payload: book_payload});
        created_users.push(user_resp.data.id);
        created_books.push(book_resp.data.id);
        reservation = reservation_payload({book_id: book_resp.data.id,
                                               user_id: user_resp.data.id});
    });

    after(async () => {
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

    describe('creates a reservation', function () {
        it('if the payload is correct', async function () {
            let reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(200, "Reservation was created");
            created_reservations.push(reservation_resp.data.user.id);
        });
    });

    describe('throws an error', function () {
        it('when trying to create a reservation without a reservation date', async function () {
            delete reservation.reservation_date;
            let reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(400, "Reservation was not created");
            expect(reservation_resp.data).to.equal("'reservation_date' is required");
        });

        it('when trying to create a reservation without a user_id', async function () {
            delete reservation.user_id;
            let reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(400, "Reservation was not created");
            expect(reservation_resp.data).to.equal("'user_id' is required");
        });

        it('when trying to create a reservation without a book_id', async function () {
            delete reservation.book_id;
            let reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(400, "Reservation was not created");
            expect(reservation_resp.data).to.equal("'book_id' is required");
        });

        it('when trying to create a reservation with reservation date set to null', async function () {
            reservation.reservation_date = null;
            let reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(400, "Reservation was not created");
            expect(reservation_resp.data).to.equal("'reservation_date' is required");
        });

        it('when trying to create a reservation with a user_id set to null', async function () {
            reservation.user_id = null;
            let reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(400, "Reservation was not created");
            expect(reservation_resp.data).to.equal("'user_id' is required");
        });

        it('when trying to create a reservation with a book_id set to null', async function () {
            reservation.book_id = null;
            let reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(400, "Reservation was not created");
            expect(reservation_resp.data).to.equal("'book_id' is required");
        });

        it('when trying to create a reservation with reservation date set to empty', async function () {
            reservation.reservation_date = "";
            let reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(400, "Reservation was not created");
            expect(reservation_resp.data).to.equal("'reservation_date' is required");
        });

        it('when trying to create a reservation with a user_id set to empty', async function () {
            reservation.user_id = "";
            let reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(400, "Reservation was not created");
            expect(reservation_resp.data).to.equal("'user_id' is required");
        });

        it('when trying to create a reservation with a book_id set to empty', async function () {
            reservation.book_id = "";
            let reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(400, "Reservation was not created");
            expect(reservation_resp.data).to.equal("'book_id' is required");
        });

        it('when trying to create a reservation with an invalid book_id', async function () {
            reservation.book_id = "123";
            let reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(400, "Reservation was not created");
            expect(reservation_resp.data).to.equal("Book with book_id = 123 was not found");
        });

        it('when trying to create a reservation with an invalid user_id', async function () {
            reservation.user_id = "123";
            let reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(400, "Reservation was not created");
            expect(reservation_resp.data).to.equal("User with user_id = 123 was not found");
        });
    });
});