const user = require("../../../models/user");
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect =  chai.expect;
const api_post = require("../../../actions/backend/api_post");
const api_put = require("../../../actions/backend/api_put");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('Edit user endpoint', function () {
    let url, user_payload, user_resp, edited_user_payload;

    beforeEach(async () => {
        url = global.backend_url + "/users";
        user_payload = user();
        user_resp = await api_post({url: url, payload: user_payload});
        edited_user_payload = Object.assign({}, user_resp.data);
    });

    afterEach(async () => {
        url = global.backend_url + `/users/${user_resp.data.id}`;
        await api_delete({url: url});
    });

    describe('when using a valid payload edits the user', function () {
        it('first_name', async function () {
            delete edited_user_payload.id;
            edited_user_payload.first_name = "EditedName";
            url = url + `/${user_resp.data.id}`;
            let edited_user_resp = await api_put({url: url, payload: edited_user_payload});
            expect(edited_user_resp.data.first_name).to.equal("EditedName");
            expect(edited_user_resp.data).excluding("first_name").to.deep.equal(user_resp.data, "User was created correctly");
        });

        it('last_name', async function () {
            delete edited_user_payload.id;
            edited_user_payload.last_name = "EditedName";
            url = url + `/${user_resp.data.id}`;
            let edited_user_resp = await api_put({url: url, payload: edited_user_payload});
            expect(edited_user_resp.data.last_name).to.equal("EditedName");
            expect(edited_user_resp.data).excluding("last_name").to.deep.equal(user_resp.data, "User was created correctly");
        });
    });

    describe('does not edit restricted value', function () {
        it('email', async function () {
            delete edited_user_payload.id;
            edited_user_payload.email = "edited@email.com";
            url = url + `/${user_resp.data.id}`;
            let edited_user_resp = await api_put({url: url, payload: edited_user_payload});
            expect(edited_user_resp.status_code).to.equal(400);
            expect(edited_user_resp.data).to.equal("'email' is invalid");
        });
    });

    describe('ignores values when trying to edit', function () {
        it('id', async function () {
            edited_user_payload.id = 123;
            url = url + `/${user_resp.data.id}`;
            let edited_user_resp = await api_put({url: url, payload: edited_user_payload});
            expect(edited_user_resp.status_code).to.equal(200);
            expect(edited_user_resp.data).to.deep.equal(user_resp.data, "User was created correctly");
        });

        it('extra values', async function () {
            edited_user_payload.extra_value = "extra";
            url = url + `/${user_resp.data.id}`;
            let edited_user_resp = await api_put({url: url, payload: edited_user_payload});
            expect(edited_user_resp.status_code).to.equal(200);
            expect(edited_user_resp.data).to.deep.equal(user_resp.data, "User was created correctly");
        });
    });

    describe('does not allow removing', function () {
        it('first_name', async function () {
            delete edited_user_payload.first_name;
            url = url + `/${user_resp.data.id}`;
            let edited_user_resp = await api_put({url: url, payload: edited_user_payload});
            expect(edited_user_resp.status_code).to.equal(400);
            expect(edited_user_resp.data).to.equal("'first_name' is required");
        });

        it('last_name', async function () {
            delete edited_user_payload.last_name;
            url = url + `/${user_resp.data.id}`;
            let edited_user_resp = await api_put({url: url, payload: edited_user_payload});
            expect(edited_user_resp.status_code).to.equal(400);
            expect(edited_user_resp.data).to.equal("'last_name' is required");
        });
    });
});
