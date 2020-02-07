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
const expect =  chai.expect;

const api_get = require("../../../actions/backend/api_get");
const api_post = require("../../../actions/backend/api_post");

chai.use(chaiExclude);

describe('View all users page', function () {
    this.timeout(60000);
    let created_users = [];

    before(async () => {
        await startWebDriver({ env: process.env.NIGHTWATCH_ENV || 'firefox' });
        await createSession({ env: process.env.NIGHTWATCH_ENV || 'firefox' });
    });

    after(async () => {
        await closeSession();
        await stopWebDriver();
        for (const entry of created_users) {
            let url = global.backend_url + `/users/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('displays', function () {
        it('all users in a table', async function () {
            let url = global.backend_url + "/users";
            let resp = await api_get({url: url});
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .waitForElementPresent("@table", 10000)
                .api.elements("@tableRow", function (result) {
                    expect(result.value.length).to.be.equal(resp.data.length);
                })
        });

        it('displays the user name and email', async function () {
            let url = global.backend_url + "/users";
            let user_payload = user();
            let user_resp = await api_post({url: url, payload: user_payload});
            created_users.push(user_resp.data.id);
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .findUserInPageById(user_resp.data.id, function (result) {
                    expect(result.value).to.contain(`${user_resp.data.first_name}`);
                    expect(result.value).to.contain(`${user_resp.data.last_name}`);
                    expect(result.value).to.contain(`${user_resp.data.email}`);
                })
        });
    });
});