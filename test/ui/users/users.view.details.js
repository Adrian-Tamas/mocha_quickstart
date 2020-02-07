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

const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('View user details', function () {
    this.timeout(60000);
    let user_resp;
    let user_payload;
    let created_users = [];

    before(async () => {
        await startWebDriver({ env: process.env.NIGHTWATCH_ENV || 'firefox' });
        await createSession({ env: process.env.NIGHTWATCH_ENV || 'firefox' });
        let url = global.backend_url + "/users";
        user_payload = user();
        user_resp = await api_post({url: url, payload: user_payload});
        created_users.push(user_resp.data.id);
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
        it('the user details in a modal window', async function () {
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .search(`${user_resp.data.email}`)
                .openUserDetailsModal(user_resp.data.id);
            await users_page
                .section
                .detailsModal
                .getGravatar((result) => {
                    expect(result.value).to.contain("http://www.gravatar.com/avatar/")
                })
                .getUserName((result) => {
                    expect(result.value).to.contain(`${user_resp.data.first_name} ${user_resp.data.last_name}`)
                })
                .getEmail((result) => {
                    expect(result.value).to.contain(`${user_resp.data.email}`)
                })
        });
    });

    describe('closes the details modal', function () {
        it('when the cancel button is pressed', async function () {
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .search(`${user_resp.data.email}`)
                .openUserDetailsModal(user_resp.data.id);
            await users_page
                .closeDetailsModalFromCancelButton();
            await users_page
                .section
                .detailsModal
                .waitForElementNotVisible("@modal", 30000);
        });

        it('when the x button is pressed', async function () {
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .search(`${user_resp.data.email}`)
                .openUserDetailsModal(user_resp.data.id);
            await users_page
                .closeDetailsModalFromXButton();
            await users_page
                .section
                .detailsModal
                .waitForElementNotVisible("@modal", 30000);
        });
    });
});