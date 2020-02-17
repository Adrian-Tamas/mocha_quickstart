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

const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('Create user', function () {
    this.timeout(60000);
    let created_users = [];

    before(async () => {
        await createSession({env: process.env.NIGHTWATCH_ENV || 'firefox'});
    });

    after(async () => {
        await closeSession();
        for (const entry of created_users) {
            let url = global.backend_url + `/users/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('creates users', function () {
        it('when the values added are correct', async function () {
            let user_details = user();
            user_details.confirm_email = user_details.email;
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .startCreateUser()
                .createUser(user_details);
            await users_page.getFlashMessageText((result) => {
                expect(result.value).to.equal(`User with name ${user_details.first_name} ${user_details.last_name} was created successfully`);
            });
            let user_id;
            await users_page.getUserId(user_details.email, (result) => {
                user_id = result.value;
                created_users.push(user_id);
            });
            await users_page
                    .openUserDetailsModal(user_id);
            await users_page
                    .section
                    .detailsModal
                    .getGravatar((result) => {
                        expect(result.value).to.contain("http://www.gravatar.com/avatar/")
                    })
                    .getUserName((result) => {
                        expect(result.value).to.contain(`${user_details.first_name} ${user_details.last_name}`)
                    })
                    .getEmail((result) => {
                        expect(result.value).to.contain(`${user_details.email}`)
                    });
        });
    });

    describe('displays errors', function () {

        it('when mandatory fields are not added', async function () {
            let user_details = user();
            user_details.email = "email";
            user_details.confirm_email = user_details.email;
            const users_page = client.page.viewAllUsersPage();
            let create_user_page = users_page
                .navigate()
                .startCreateUser();
            await create_user_page.isFirstNameARequiredField((result) => {
                expect(Boolean(result.value), "checking first name is required").to.be.true;
            });
            await create_user_page.isLastNameARequiredField((result) => {
                expect(Boolean(result.value), "checking last name is required").to.be.true;
            });
            await create_user_page.isEmailARequiredField((result) => {
                expect(Boolean(result.value), "checking email is required").to.be.true;
            });
            await create_user_page.isConfirmEmailARequiredField((result) => {
                expect(Boolean(result.value), "checking confirmation email is required").to.be.true;
            });
        });

        it('when the email is not in the correct format', async function () {
            let user_details = user();
            user_details.email = "email";
            user_details.confirm_email = user_details.email;
            const users_page = client.page.viewAllUsersPage();
            let create_user_page = users_page
                .navigate()
                .startCreateUser()
                .createUser(user_details, false)
                .tryAndConfirmCreate(false);
            await create_user_page
                .getFlashMessageText((result) => {
                    expect(result.value).to.equal("There was an error saving the user. Please fix all issues and try again!");
                });
            await create_user_page
                .getFieldErrorMessage("email", (result) => {
                    expect(result.value).to.equal("Invalid email address.");
                })
                .getFieldErrorMessage("confirm_email", (result) => {
                    expect(result.value).to.equal("Invalid email address.");
                });
        });

        it('when the confirmation email is not the same', async function () {
            let user_details = user();
            user_details.confirm_email = "email@email.com";
            const users_page = client.page.viewAllUsersPage();
            let create_user_page = users_page
                .navigate()
                .startCreateUser()
                .createUser(user_details, false)
                .tryAndConfirmCreate(false);
            await create_user_page
                .getFlashMessageText((result) => {
                    expect(result.value).to.equal("There was an error saving the user. Please fix all issues and try again!");
                });
            await create_user_page
                .getFieldErrorMessage("confirm_email", (result) => {
                    expect(result.value).to.equal("Emails do not match");
                });
        });

        it('when a user with the email already exists', async function () {
            let user_details = user();
            let url = global.backend_url + "/users";
            let user_resp = await api_post({url: url, payload: user_details});
            created_users.push(user_resp.data.id);
            user_details.confirm_email = user_details.email;
            const users_page = client.page.viewAllUsersPage();
            let create_user_page = users_page
                .navigate()
                .startCreateUser()
                .createUser(user_details, false)
                .tryAndConfirmCreate(false);
            await create_user_page
                .getFlashMessageText((result) => {
                    expect(result.value).to.equal(`There was an error saving the user because: "User with email: ${user_details.email} already exists". Please try again!`);
                });
        });

        it('when a user specifies less than 2 characters for the first and/or last name', async function () {
            let user_details = user();
            user_details.confirm_email = user_details.email;
            user_details.first_name = "a";
            user_details.last_name = "a";
            const users_page = client.page.viewAllUsersPage();
            let create_user_page = users_page
                .navigate()
                .startCreateUser()
                .createUser(user_details, false)
                .tryAndConfirmCreate(false);
            await create_user_page
                .getFlashMessageText((result) => {
                    expect(result.value).to.equal("There was an error saving the user. Please fix all issues and try again!");
                });
            await create_user_page
                .getFieldErrorMessage("first_name", (result) => {
                    expect(result.value).to.equal("Field must be at least 2 characters long.");
                })
                .getFieldErrorMessage("last_name", (result) => {
                    expect(result.value).to.equal("Field must be at least 2 characters long.");
                });
        });
    });

    describe('cancels user creation', function () {

        it('when the user cancels the process', async function () {
            let user_details = user();
            user_details.confirm_email = user_details.email;
            const users_page = client.page.viewAllUsersPage();
            await users_page
                .navigate()
                .startCreateUser()
                .createUser(user_details, false)
                .cancelCreate();
            await users_page
                .search(`${user_details.email}`)
                .getDisplayedRows((result) => {
                    expect(result.value.length).to.equal(0);
                });
        });
    });
});