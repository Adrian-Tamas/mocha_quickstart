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

describe('Delete Reservations Endpoint', function() {
    let created_books = [];
    let created_users = [];
    let created_reservations = [];
    let url, user_resp, book_resp, reservation, reservation_resp;

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

    describe('removes', function () {
        it('the reservation identified by user_id and book_id', async function () {
            url = url + `/user/${reservation.user_id}/book/${reservation.book_id}`;
            let resp = await api_delete({url: url});
            expect(resp.status_code).to.equal(200);
            expect(resp.data).to.equal(`Deleted reservation for user ${reservation.user_id} and book ${reservation.book_id}`);
        });

        it('all reservations for a user', async function () {
            let second_book_payload = book();
            let second_book_resp = await api_post({url: global.backend_url + "/books", payload: second_book_payload});
            let second_reservation = reservation_payload({
                book_id: second_book_resp.data.id,
                user_id: user_resp.data.id,
                reservation_expiration_date: "12/12/2020"
            });
            reservation_resp = await api_post({url: url, payload: second_reservation});
            url = url + `/user/${reservation.user_id}`;
            let resp = await api_delete({url: url});
            expect(resp.status_code).to.equal(200);
            expect(resp.data).to.equal(`Deleted 2 reservations for user ${reservation.user_id}`);
        });

        it('the reservation for a book', async function () {
            url = url + `/book/${reservation.book_id}`;
            let resp = await api_delete({url: url});
            expect(resp.status_code).to.equal(200);
            expect(resp.data).to.equal(`Deleted reservation for book ${reservation.book_id}`);
        });
    });

    describe('returns an error', function () {

        beforeEach(async () => {
            created_reservations.push(reservation_resp.data.user.id);
        });

        it('when trying to delete a reservation that does not exist for a book', async function () {
            url = url + "/book/123";
            let resp = await api_delete({url: url});
            expect(resp.status_code).to.equal(400);
            expect(resp.data).to.equal("Reservation with book_id = 123 was not found");
        });

        it('when trying to delete a reservation that does not exist  for a user', async function () {
            url = url + "/user/123";
            let resp = await api_delete({url: url});
            expect(resp.status_code).to.equal(400);
            expect(resp.data).to.equal("Reservation with user_id = 123 was not found");
        });

        it('when trying to delete a reservation that does not exist', async function () {
            url = url + "/user/123/book/123";
            let resp = await api_delete({url: url});
            expect(resp.status_code).to.equal(400);
            expect(resp.data).to.equal("Reservation with (user_id, book_id) = ('123', '123') was not found");
        });
    });
});