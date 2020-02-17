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

describe('View all reservations', function () {
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

    describe('displays', function () {
        it('all reservations in a table', async function () {
            let url = global.backend_url + "/reservations";
            let reservations_resp = await api_get({url: url});
            const reservations_page = client.page.viewAllReservationsPage();
            await reservations_page
                .navigate()
                .waitForElementPresent("@table", 10000)
                .api.elements("@tableRow", function (result) {
                    expect(result.value.length).to.be.equal(reservations_resp.data.length);
                })
        });

        it('displays the reservation details', async function () {
            const reservations_page = client.page.viewAllReservationsPage();
            await reservations_page
                .navigate()
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
});
