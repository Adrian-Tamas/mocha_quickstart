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

describe('Get Reservations Endpoint', function() {
    let created_books = [];
    let created_users = [];
    let created_reservations = [];
    let url, user_resp, book_resp, reservation, reservation_resp;

    beforeEach(async () => {
        url = global.backend_url + "/reservations";
    });

    describe('returns', function () {
        beforeEach(async () => {
            let book_payload = book();
            let user_payload = user();
            user_resp = await api_post({url: global.backend_url + "/users", payload: user_payload});
            book_resp = await api_post({url: global.backend_url + "/books", payload: book_payload});
            created_users.push(user_resp.data.id);
            created_books.push(book_resp.data.id);
            reservation = reservation_payload({book_id: book_resp.data.id,
                user_id: user_resp.data.id});
            reservation_resp = await api_post({url: url, payload: reservation});
            expect(reservation_resp.status_code).to.equal(200, "Reservation was created");
            created_reservations.push(reservation_resp.data.user.id);
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

        it('all reservations', async function () {
            let reservations_resp = await api_get({url: url});
            expect(reservations_resp.status_code).to.equal(200, "Reservations returned");
            expect(reservations_resp.data).to.have.lengthOf.above(0);
            expect(reservations_resp.data).to.deep.include(reservation_resp.data);
        });

        it('reservation by book id', async function () {
            url = url + `/book/${book_resp.data.id}`;
            let reservations_resp = await api_get({url: url});
            expect(reservations_resp.status_code).to.equal(200, "Reservations returned");
            expect(reservations_resp.data).to.have.lengthOf.at.least(1);
            expect(reservations_resp.data[0].book).to.deep.equal(book_resp.data);
        });

        it('reservation by user id', async function () {
            url = url + `/user/${user_resp.data.id}`;
            let reservations_resp = await api_get({url: url});
            expect(reservations_resp.status_code).to.equal(200, "Reservations returned");
            expect(reservations_resp.data).to.have.lengthOf.at.least(1);
            expect(reservations_resp.data[0].user).to.deep.equal(user_resp.data);
        });

        it('reservation by user id and book id', async function () {
            url = url + `/user/${user_resp.data.id}/book/${book_resp.data.id}`;
            let reservations_resp = await api_get({url: url});
            expect(reservations_resp.status_code).to.equal(200, "Reservations returned");
            expect(reservations_resp.data.user).to.deep.equal(user_resp.data);
            expect(reservations_resp.data.book).to.deep.equal(book_resp.data);
        });
    });

    describe('fails', function () {

        it('getting the reservation by an invalid book_id', async function () {
            url = url + "/book/123";
            let reservations_resp = await api_get({url: url});
            expect(reservations_resp.status_code).to.equal(200);
            expect(reservations_resp.data).to.have.lengthOf(0);
        });

        it('getting the reservation by an invalid user_id', async function () {
            url = url + "/user/123";
            let reservations_resp = await api_get({url: url});
            expect(reservations_resp.status_code).to.equal(200);
            expect(reservations_resp.data).to.have.lengthOf(0);
        });

        it('getting the reservation by an invalid user_id and book_id', async function () {
            url = url + "/user/123/book/123";
            let reservations_resp = await api_get({url: url});
            expect(reservations_resp.status_code).to.equal(400);
            expect(reservations_resp.data).to.equal("Reservation with (user_id, book_id) = ('123', '123') was not found");
        });
    });
});