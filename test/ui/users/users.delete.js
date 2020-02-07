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

describe('Delete user', function () {
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

    describe('Removes user', function () {

        it('when the delete user is confirmed', async function () {
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .search(`${user_resp.data.email}`)
                .openUserDeleteModal(user_resp.data.id);
            await users_page
                .section
                .deleteModal
                .getMessageText((result) => {
                    expect(result.value).to.equal("Are you sure you want to delete the selected User?");
                });
            await users_page
                .confirmUserDelete();
            await users_page
                .getFlashMessageText((result) => {
                    expect(result.value).to.equal(`User with id: ${user_resp.data.id} has been successfully deleted!`);
                });
            await users_page
                .search(`${user_resp.data.email}`)
                .getDisplayedRows((result) => {
                    expect(result.value).to.have.length(0);
                });
        });
    });

    describe('Does not remove user', function () {

        it('when the delete user is canceled', async function () {
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .search(`${user_resp.data.email}`)
                .openUserDeleteModal(user_resp.data.id);
            await users_page
                .section
                .deleteModal
                .getMessageText((result) => {
                    expect(result.value).to.equal("Are you sure you want to delete the selected User?");
                });
            await users_page
                .cancelUserDelete();
            await users_page
                .search(`${user_resp.data.email}`)
                .getDisplayedRows((result) => {
                    expect(result.value).to.have.length(1);
                });
        });

        it.only('when the delete user modal is closed', async function () {
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .search(`${user_resp.data.email}`)
                .openUserDeleteModal(user_resp.data.id);
            await users_page
                .section
                .deleteModal
                .getMessageText((result) => {
                    expect(result.value).to.equal("Are you sure you want to delete the selected User?");
                });
            await users_page
                .closeUserDeleteModal();
            await users_page
                .search(`${user_resp.data.email}`)
                .getDisplayedRows((result) => {
                    expect(result.value).to.have.length(1);
                });
        });
    });
});
