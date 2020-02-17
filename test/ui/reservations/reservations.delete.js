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

describe('Delete reservations', function () {
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

    describe('Removes the reservation', function () {

        it('when the user confirms the delete', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            let reservation_id = `${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`;
            await reservations_page
                .navigate()
                .openReservationDeleteModal(reservation_id);
            await reservations_page
                .section
                .deleteModal
                .getMessageText((result) => {
                    expect(result.value).to.equal("Are you sure you want to delete the selected Reservation?");
                });
            await reservations_page
                .confirmReservationDelete();
            await reservations_page
                .getFlashMessageText((result) => {
                    expect(result.value).to.equal(`Reservation for user with id: ${user_resp.data.id} and book with id: ${book_resp.data.id} has been successfully deleted!`);
                });
            await reservations_page
                .search(`${user_resp.data.email}`)
                .getDisplayedRows((result) => {
                    expect(result.value).to.have.length(0);
                });
        });
    });

    describe('Does not remove the reservation', function () {

        it('when the user cancels the delete', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            let reservation_id = `${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`;
            await reservations_page
                .navigate()
                .openReservationDeleteModal(reservation_id);
            await reservations_page
                .section
                .deleteModal
                .getMessageText((result) => {
                    expect(result.value).to.equal("Are you sure you want to delete the selected Reservation?");
                });
            await reservations_page
                .cancelReservationDelete();
            await reservations_page
                .search(`${user_resp.data.email}`)
                .getDisplayedRows((result) => {
                    expect(result.value).to.have.length(1);
                });
        });

        it('when the user closes the delete modal', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            let reservation_id = `${reservation_resp.data.user.id}_${reservation_resp.data.book.id}`;
            await reservations_page
                .navigate()
                .openReservationDeleteModal(reservation_id);
            await reservations_page
                .section
                .deleteModal
                .getMessageText((result) => {
                    expect(result.value).to.equal("Are you sure you want to delete the selected Reservation?");
                });
            await reservations_page
                .closeReservationDeleteModal();
            await reservations_page
                .search(`${user_resp.data.email}`)
                .getDisplayedRows((result) => {
                    expect(result.value).to.have.length(1);
                });
        });
    });
});