const user = require("../../../models/user");
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect =  chai.expect;
const api_get = require("../../../actions/backend/api_get");
const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('Create Users Endpoint', function() {
    let created_users = [];

    after(async () => {
        for (const entry of created_users) {
            let url = global.backend_url + `/users/${entry}`;
            await api_delete({url: url});
        }
    });

    describe('creates a user', function () {
        it('if valid payload is sent', async function () {
            let url = global.backend_url + "/users";
            let user_payload = user();
            let user_resp = await api_post({url: url, payload: user_payload});
            expect(user_resp.status_code).to.equal(200, "User was created");
            expect(user_payload).excluding("id").to.deep.equal(user_resp.data, "User was created correctly");
            url = url + `/${user_resp.data.id}`;
            let user_resource = await api_get({url: url});
            expect(user_resp.data).to.deep.equal(user_resource.data, "User was also saved");
            created_users.push(user_resp.data.id);
        });

        it('and ignores extra params in the payload', async function () {
            let url = global.backend_url + "/users";
            let user_payload = user();
            user_payload.extra_param = "test";
            let user_resp = await api_post({url: url, payload: user_payload});
            expect(user_resp.status_code).to.equal(200, "User was created");
            expect(user_resp.data).to.not.have.property("extra_param");
            created_users.push(user_resp.data.id);
        });
    });

    describe('fails', function () {
        it('if the first_name is not sent', async function () {
            let url = global.backend_url + "/users";
            let user_payload = user();
            delete user_payload.first_name;
            let user_resp = await api_post({url: url, payload: user_payload});
            expect(user_resp.status_code).to.equal(400, "Error when creating the user");
            expect(user_resp.data).to.equal("'first_name' is required");
        });

        it('if the first_name is null', async function () {
            let url = global.backend_url + "/users";
            let user_payload = user();
            user_payload.first_name = null;
            let user_resp = await api_post({url: url, payload: user_payload});
            expect(user_resp.status_code).to.equal(400, "Error when creating the user");
            expect(user_resp.data).to.equal("'first_name' is required");
        });

        it('if the last_name is not sent', async function () {
            let url = global.backend_url + "/users";
            let user_payload = user();
            delete user_payload.last_name;
            let user_resp = await api_post({url: url, payload: user_payload});
            expect(user_resp.status_code).to.equal(400, "Error when creating the user");
            expect(user_resp.data).to.equal("'last_name' is required");
        });

        it('if the last_name is null', async function () {
            let url = global.backend_url + "/users";
            let user_payload = user();
            user_payload.last_name = null;
            let user_resp = await api_post({url: url, payload: user_payload});
            expect(user_resp.status_code).to.equal(400, "Error when creating the user");
            expect(user_resp.data).to.equal("'last_name' is required");
        });


        it('if the email is not sent', async function () {
            let url = global.backend_url + "/users";
            let user_payload = user();
            delete user_payload.email;
            let user_resp = await api_post({url: url, payload: user_payload});
            expect(user_resp.status_code).to.equal(400, "Error when creating the user");
            expect(user_resp.data).to.equal("'email' is required");
        });

        it('if the email is null', async function () {
            let url = global.backend_url + "/users";
            let user_payload = user();
            user_payload.email = null;
            let user_resp = await api_post({url: url, payload: user_payload});
            expect(user_resp.status_code).to.equal(400, "Error when creating the user");
            expect(user_resp.data).to.equal("'email' is required");
        });

        it('if the email is not valid', async function () {
            let url = global.backend_url + "/users";
            let user_payload = user();
            user_payload.email = "invalid_email";
            let user_resp = await api_post({url: url, payload: user_payload});
            expect(user_resp.status_code).to.equal(400, "Error when creating the user");
            expect(user_resp.data).to.equal("'email' is invalid");
        });

        it('if the email is already in use', async function () {
            let url = global.backend_url + "/users";
            let user_payload = user();
            let user_resp = await api_post({url: url, payload: user_payload});

            let new_user_payload = user();
            new_user_payload.email = user_resp.data.email;
            let new_user_resp = await api_post({url: url, payload: new_user_payload});
            expect(new_user_resp.status_code).to.equal(400, "Error creating the user");
            expect(new_user_resp.data).to.equal(`User with email: ${new_user_payload.email} already exists`);
        })
    });
});
