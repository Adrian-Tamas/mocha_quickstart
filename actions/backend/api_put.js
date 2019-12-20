const request = require("axios").default;

module.exports = function apiPut({url, payload, headers=undefined} = {}) {
    let config = {};
    if (headers !== undefined) {
        config.headers = headers;
    }
    return request.put(url, payload, config)
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