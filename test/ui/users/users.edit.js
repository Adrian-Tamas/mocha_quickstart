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

describe('Edit user details', function () {
    this.timeout(60000);
    let user_resp;
    let user_payload;
    let created_users = [];

    before(async () => {
        await createSession({ env: process.env.NIGHTWATCH_ENV || 'firefox' });
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

    describe('Edits user', function () {

        it('when a new first name is specified', async function () {
            let users_page = client.page.viewAllUsersPage();
            user_payload.first_name = "NewName";
            let edit_user_page = users_page
                .navigate()
                .search(`${user_resp.data.email}`)
                .startUserEdit(user_resp.data.id);
            users_page = edit_user_page
                .updateUserInfo(user_payload);
            await users_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`User with id: ${user_resp.data.id} was edited successfully`);
            });
            await users_page
                .search(`${user_resp.data.email}`)
                .openUserDetailsModal(user_resp.data.id);
            await users_page
                .section
                .detailsModal
                .getGravatar((result) => {
                    expect(result.value).to.contain("http://www.gravatar.com/avatar/")
                })
                .getUserName((result) => {
                    expect(result.value).to.contain(`${user_payload.first_name} ${user_payload.last_name}`)
                })
                .getEmail((result) => {
                    expect(result.value).to.contain(`${user_payload.email}`)
                })
        });

        it('when a new last name is specified', async function () {
            let users_page = client.page.viewAllUsersPage();
            user_payload.last_name = "NewName";
            let edit_user_page = users_page
                .navigate()
                .search(`${user_resp.data.email}`)
                .startUserEdit(user_resp.data.id);
            users_page = edit_user_page
                .updateUserInfo(user_payload);
            await users_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`User with id: ${user_resp.data.id} was edited successfully`);
            });
            await users_page
                .search(`${user_resp.data.email}`)
                .openUserDetailsModal(user_resp.data.id);
            await users_page
                .section
                .detailsModal
                .getGravatar((result) => {
                    expect(result.value).to.contain("http://www.gravatar.com/avatar/")
                })
                .getUserName((result) => {
                    expect(result.value).to.contain(`${user_payload.first_name} ${user_payload.last_name}`)
                })
                .getEmail((result) => {
                    expect(result.value).to.contain(`${user_payload.email}`)
                })
        });
    });

    describe('does not allow', function () {

        it('to change the user id or email', async function () {
            let users_page = client.page.viewAllUsersPage();
            let edit_user_page = users_page
                .navigate()
                .search(`${user_resp.data.email}`)
                .startUserEdit(user_resp.data.id);
            await edit_user_page
                .isIdAReadonlyField((result) => {
                    expect(Boolean(result.value), "checking id is readonly").to.be.true;
                })
                .isEmailAReadonlyField((result) => {
                    expect(Boolean(result.value), "checking email is readonly").to.be.true;
                })
        });

        it('to remove the first and last names', async function () {
            let users_page = client.page.viewAllUsersPage();
            let edit_user_page = users_page
                .navigate()
                .search(`${user_resp.data.email}`)
                .startUserEdit(user_resp.data.id);
            await edit_user_page
                .isFirstNameARequiredField((result) => {
                    expect(Boolean(result.value), "checking first name is required").to.be.true;
                })
                .isLastNameARequiredField((result) => {
                    expect(Boolean(result.value), "checking last name is required").to.be.true;
                })
        });
    });

    describe('shows errors', function () {

        it('when the user ads less then 2 characters for the first name', async function () {
            let users_page = client.page.viewAllUsersPage();
            user_payload.first_name="a";
            let edit_user_page = users_page
                .navigate()
                .search(`${user_resp.data.email}`)
                .startUserEdit(user_resp.data.id);
            await edit_user_page
                .updateUserInfo(user_payload, false)
                .tryAndConfirmEdit();
            await edit_user_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`There was an error editing the user`);
            });
            await edit_user_page
                .getFieldErrorMessage("first_name", (result) => {
                    expect(result.value).to.equal("Field must be at least 2 characters long.");
                })
        });

        it('when the user ads less then 2 characters for the last name', async function () {
            let users_page = client.page.viewAllUsersPage();
            user_payload.last_name="a";
            let edit_user_page = users_page
                .navigate()
                .search(`${user_resp.data.email}`)
                .startUserEdit(user_resp.data.id);
            await edit_user_page
                .updateUserInfo(user_payload, false)
                .tryAndConfirmEdit();
            await edit_user_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`There was an error editing the user`);
            });
            await edit_user_page
                .getFieldErrorMessage("last_name", (result) => {
                    expect(result.value).to.equal("Field must be at least 2 characters long.");
                })
        });
    });
});