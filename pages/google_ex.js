const googleCommands = {
    submit: function(searchTerm) {
        return this.waitForElementVisible("@body", 5000)
            .setValue('@searchField', searchTerm)
            .waitForElementVisible("@searchButton", 5000)
            .click("@searchButton")
    }
}

module.exports = {
    commands: [googleCommands],
    url: function () {
        return this.api.launch_url;
    },
    elements: {
        body: 'body',
        searchField: 'input[type=text]',
        searchButton: 'input[name=btnK]'
    }
};