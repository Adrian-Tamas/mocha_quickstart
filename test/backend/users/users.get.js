const expect =  require("chai").expect;
const api_get = require("../../../actions/backend/api_get");
const api_post = require("../../../actions/backend/api_post");
const user = require("../../../models/user");

describe('Get Users Endpoint', function() {
    describe('Get All Users Endpoint', function() {
        it('returns all the users', async function () {
            let url = global.backend_url + "/users";
            let get_response = await api_get({url: url});
            expect(get_response.status_code).to.equal(200, "200 OK");
            expect(get_response.data).to.have.lengthOf.above(0);
        });
    });

    describe("Get user by id", function () {
        it("returns and error if an invalid id is provide", async function () {
            let url = global.backend_url + "/users/123";
            let get_response = await api_get({url: url});
            expect(get_response.status_code).to.equal(400, "User was not found");
        });

        it('returns a valid user if an id is provided', async function () {
            let url = global.backend_url + `/users`;
            let user_payload = user();
            let user_resp = await api_post({url: url, payload: user_payload});
            url = url + `/${user_resp.data.id}`;
            let get_response = await api_get({url: url});
            expect(get_response.status_code).to.equal(200, "User was found");
            expect(get_response.data).to.deep.equal(get_response.data, "User matches the user returned from the request");
        });
    });
});
