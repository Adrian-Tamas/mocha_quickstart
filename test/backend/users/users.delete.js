const user = require("../../../models/user");
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect =  chai.expect;
const api_post = require("../../../actions/backend/api_post");
const api_delete = require("../../../actions/backend/api_delete");

chai.use(chaiExclude);

describe('Delete users endpoint', function () {
    let url;

    beforeEach(async () => {
        url = global.backend_url + "/users";
    });

    describe('Deletes user', function () {
        it('if the call is correct', async function () {
            let user_payload = user();
            let user_resp = await api_post({url: url, payload: user_payload});
            url = url + `/${user_resp.data.id}`;
            let del_resp = await api_delete({url: url});
            expect(del_resp.status_code).to.equal(200, "User was deleted");
            expect(del_resp.data).to.equal(`Successfully deleted user ${user_resp.data.id}`);
        });
    });

    describe('Fails', function () {
        it('the user with the provided id does not exist', async function () {
            url = url + "/123";
            let del_resp = await api_delete({url: url});
            expect(del_resp.status_code).to.equal(400, "User was deleted");
            expect(del_resp.data).to.equal("User with id = 123 was not found");
        });
    });
});
