const book = require("../../../models/book");
const user = require("../../../models/user");
const reservation_payload = require("../../../models/reservations_payload");
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect =  chai.expect;
const api_post = require("../../../actions/backend/api_post");
const api_put = require("../../../actions/backend/api_put");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('Edit Reservations Endpoint', function() {
    let created_books = [];
    let created_users = [];
    let created_reservations = [];
    let url, user_resp, book_resp, reservation, reservation_resp, edited_reservation_payload;

    beforeEach(async () => {
        url = global.backend_url + "/reservations";
        let book_payload = book();
        let user_payload = user();
        user_resp = await api_post({url: global.backend_url + "/users", payload: user_payload});
        book_resp = await api_post({url: global.backend_url + "/books", payload: book_payload});
        created_users.push(user_resp.data.id);
        created_books.push(book_resp.data.id);
        reservation = reservation_payload({
            book_id: book_resp.data.id,
            user_id: user_resp.data.id,
            reservation_expiration_date: "12/12/2020"
        });
        reservation_resp = await api_post({url: url, payload: reservation});
        created_reservations.push(reservation_resp.data.user.id);
        edited_reservation_payload = Object.assign({}, reservation);
        url = url + `/user/${reservation.user_id}/book/${reservation.book_id}`;
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

    describe('updates the reservation', function () {
        it('with a new reservation_date', async function () {
            edited_reservation_payload.reservation_date = "12/12/2019";
            let edit_resp = await api_put({url: url, payload: edited_reservation_payload});
            expect(edit_resp.status_code).to.equal(200);
            expect(edit_resp.data).excluding("reservation_date").to.deep.equal(reservation_resp.data);
            expect(edit_resp.data.reservation_date).to.equal("12/12/2019")
        });

        it('with a new reservation_expiration_date', async function () {
            edited_reservation_payload.reservation_expiration_date = "12/12/2019";
            let edit_resp = await api_put({url: url, payload: edited_reservation_payload});
            expect(edit_resp.status_code).to.equal(200);
            expect(edit_resp.data).excluding("reservation_expiration_date").to.deep.equal(reservation_resp.data);
            expect(edit_resp.data.reservation_expiration_date).to.equal("12/12/2019")
        });

        it('removing the reservation_expiration_date', async function () {
            delete edited_reservation_payload.reservation_expiration_date;
            let edit_resp = await api_put({url: url, payload: edited_reservation_payload});
            expect(edit_resp.status_code).to.equal(200);
            expect(edit_resp.data).excluding("reservation_expiration_date").to.deep.equal(reservation_resp.data);
            expect(edit_resp.data.reservation_expiration_date).to.be.null;
        });
    });

    describe('returns an error when', function () {
        it('trying to edit the book_id', async function () {
            edited_reservation_payload.book_id = "123";
            let edit_resp = await api_put({url: url, payload: edited_reservation_payload});
            expect(edit_resp.status_code).to.equal(400);
            expect(edit_resp.data).to.equal(`Reservation for user: ${reservation.user_id} and book: ${reservation.book_id} is invalid`);
        });

        it('trying to edit the user_id', async function () {
            edited_reservation_payload.user_id = "123";
            let edit_resp = await api_put({url: url, payload: edited_reservation_payload});
            expect(edit_resp.status_code).to.equal(400);
            expect(edit_resp.data).to.equal(`Reservation for user: ${reservation.user_id} and book: ${reservation.book_id} is invalid`);
        });

        it('trying to remove the reservation_date', async function () {
            delete edited_reservation_payload.reservation_date;
            let edit_resp = await api_put({url: url, payload: edited_reservation_payload});
            expect(edit_resp.status_code).to.equal(400);
            expect(edit_resp.data).to.equal("'reservation_date' is required");
        });

        it('trying to edit the reservation_date to empty', async function () {
            edited_reservation_payload.reservation_date = "";
            let edit_resp = await api_put({url: url, payload: edited_reservation_payload});
            expect(edit_resp.status_code).to.equal(400);
            expect(edit_resp.data).to.equal("'reservation_date' is required");
        });

        it('trying to edit a reservation that does not exist', async function () {
            url = global.backend_url + `/reservations/user/${reservation.user_id}/book/123`;
            edited_reservation_payload.reservation_date = "12/12/2019";
            let edit_resp = await api_put({url: url, payload: edited_reservation_payload});
            expect(edit_resp.status_code).to.equal(400);
            expect(edit_resp.data).to.equal(`Reservation for user: ${reservation.user_id} and book: 123 is invalid`);
        });
    });
});