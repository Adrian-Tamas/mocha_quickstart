const request = require("axios").default;

module.exports = function apiGet({url, headers=undefined} = {}) {
    let config = {};
    if (headers !== undefined) {
        config.headers = headers;
    }
    return request.get(url, config)
        .then((response)=> {
            return {
                status_code: response.status,
                data: response.data};
        }).catch((error) => {
            return {
                status_code: error.response.status,
                data: error.response.data};
        })
};