const {
    client,
    createSession,
    closeSession,
    startWebDriver,
    stopWebDriver,
    getNewScreenshots
} = require('nightwatch-api');
const user = require("../../../models/user");
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect = chai.expect;

const api_get = require("../../../actions/backend/api_get");
const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('View users', function () {
    this.timeout(60000);
    let user_resp;
    let user_payload;
    let created_users = [];

    before(async () => {
        await createSession({env: process.env.NIGHTWATCH_ENV || 'firefox'});
        let url = global.backend_url + "/users";
        user_payload = user();
        user_resp = await api_post({url: url, payload: user_payload});
        created_users.push(user_resp.data.id);
    });

    after(async () => {
        await closeSession();
        for (const entry of created_users) {
            let url = global.backend_url + `/users/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('filters users', function () {
        it('by first name', async function () {
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .search(`${user_resp.data.first_name}`);
            await users_page
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
            await users_page
                .findUserInPageById(user_resp.data.id, (result) => {
                    expect(result.value).to.contain(`${user_resp.data.first_name}`);
                    expect(result.value).to.contain(`${user_resp.data.last_name}`);
                    expect(result.value).to.contain(`${user_resp.data.email}`);
                });
        });

        it('by last name', async function () {
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .search(`${user_resp.data.last_name}`);
            await users_page
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
            await users_page
                .findUserInPageById(user_resp.data.id, (result) => {
                    expect(result.value).to.contain(`${user_resp.data.first_name}`);
                    expect(result.value).to.contain(`${user_resp.data.last_name}`);
                    expect(result.value).to.contain(`${user_resp.data.email}`);
                });
        });

        it('by email', async function () {
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .search(`${user_resp.data.email}`);
            await users_page
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
            await users_page
                .findUserInPageById(user_resp.data.id, (result) => {
                    expect(result.value).to.contain(`${user_resp.data.first_name}`);
                    expect(result.value).to.contain(`${user_resp.data.last_name}`);
                    expect(result.value).to.contain(`${user_resp.data.email}`);
                });
        });

        it('by partial first name', async function () {
            const users_page = client.page.viewAllUsersPage();
            const search_term = `${user_resp.data.first_name}`.substring(0, 5).toLowerCase();
            await users_page
                .navigate()
                .search(search_term);
            await users_page
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
            await users_page
                .findUserInPageById(user_resp.data.id, (result) => {
                    expect(result.value).to.contain(`${user_resp.data.first_name}`);
                    expect(result.value).to.contain(`${user_resp.data.last_name}`);
                    expect(result.value).to.contain(`${user_resp.data.email}`);
                });
        });

        it('by partial last name', async function () {
            const users_page = client.page.viewAllUsersPage();
            const search_term = `${user_resp.data.last_name}`.substring(0, 5).toLowerCase();
            await users_page
                .navigate()
                .search(search_term);
            await users_page
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
            await users_page
                .findUserInPageById(user_resp.data.id, (result) => {
                    expect(result.value).to.contain(`${user_resp.data.first_name}`);
                    expect(result.value).to.contain(`${user_resp.data.last_name}`);
                    expect(result.value).to.contain(`${user_resp.data.email}`);
                });
        });

        it('by partial email', async function () {
            const users_page = client.page.viewAllUsersPage();
            const search_term = `${user_resp.data.email}`.substring(0, 5).toLowerCase();
            await users_page
                .navigate()
                .search(search_term);
            await users_page
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
            await users_page
                .findUserInPageById(user_resp.data.id, (result) => {
                    expect(result.value).to.contain(`${user_resp.data.first_name}`);
                    expect(result.value).to.contain(`${user_resp.data.last_name}`);
                    expect(result.value).to.contain(`${user_resp.data.email}`);
                });
        });
    });

    describe('show an empty table', function () {
        it('when the search term does not match anything', async function () {
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .search("aaaaaaaaaaaaa");
            await users_page
                .getDisplayedRows(function (res) {
                    expect(res.value.length).to.equal(0);
                });
        });
    });
});