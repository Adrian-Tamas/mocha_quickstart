const commands = {
    findUserInPageById: function (id, callback) {
        const page = this;
        page.api.getText("css selector",`.clickable-row[data-id="${id}"]:not([style*='display: none']`, callback);
        return page;
    },

    openUserDetailsModal: async function (id) {
        const page = this;
        await page.api.execute("$('#viewUserDetailsModal').removeClass('fade')");
        page.api.jqueryClick(`.clickable-row[data-id="${id}"]`);
        page.section.menu
            .click("@viewDetails");
        page.section.detailsModal
            .waitForElementVisible("@modal", 30000);
        return page;
    },

    search: function(searchTerm) {
        const page = this;
        page.waitForElementVisible("@table", 30000)
            .clearValue('@searchField')
            .setValue('@searchField', searchTerm);
        return page;
    },

    closeDetailsModalFromCancelButton: async function () {
        const page = this;
        await page.api.execute("$.find('#viewUserCancelButton')[0].click()");
        return page;
    },

    closeDetailsModalFromXButton: async function () {
        const page = this;
        await page.api.execute("$.find('#viewUserDetailsModal .close')[0].click()");
        return page;
    },

    getDisplayedRows: async function(callback) {
        const page = this;
        await page.api.elements("css selector", ".clickable-row:not([style*='display: none']",  callback);
        return page;
    },

    startCreateUser: function() {
        const context = this;
        context.section.menu
            .click("@createUser");
        return context.api.page.createUserPage();
    },

    getUserId: async function(searchTerm, callback) {
        const page = this;
        page.waitForElementVisible("@table", 30000)
            .setValue('@searchField', searchTerm);
        await page.api.waitForCondition(`return $(".clickable-row:not([style*='display: none']").first().text().includes("${searchTerm}");`);
        page.getAttribute("css selector", ".clickable-row:not([style*='display: none'])", "id", callback);
        return page;
    },


    getFlashMessageText: function (callback) {
        const page = this;
        page.getText("@message", callback);
        return page;
    },

    startUserEdit: function(id) {
        const context = this;
        context.api.jqueryClick(`.clickable-row[data-id="${id}"]`);
        context.section.menu
            .click("@editUser");
        return context.api.page.editUserPage();
    },

    openUserDeleteModal: async function (id) {
        const page = this;
        await page.api.execute("$('#deleteModal').removeClass('fade')");
        page.api.jqueryClick(`.clickable-row[data-id="${id}"]`);
        page.section.menu
            .click("@deleteUser");
        page.section.deleteModal
            .waitForElementVisible("@modal", 30000);
        return page;
    },

    confirmUserDelete: async function () {
        const page = this;
        await page
            .section
            .deleteModal
            .click("@confirmDeleteModal");
        await page
            .section
            .deleteModal
            .waitForElementNotVisible("@modal", 30000);
        return page;
    },

    cancelUserDelete: async function () {
        const page = this;
        await page
            .section
            .deleteModal
            .click("@closeDeleteModal");
        await page
            .section
            .deleteModal
            .waitForElementNotVisible("@modal", 30000);
        return page;
    },

    closeUserDeleteModal: async function () {
        const page = this;
        await page.api.execute("$.find('#deleteModal .close')[0].click()");
        await page
            .section
            .deleteModal
            .waitForElementNotVisible("@modal", 30000);
        return page;
    },
};

module.exports = {
    commands: [commands],
    url: function () {
        return global.ui_url + "/users";
    },
    elements: {
        table: '#table',
        searchField: '#searchField',
        tableRow: '.clickable-row',
        message: '.alert',
    },
    sections: {
        menu: {
            selector: '.btn-group',
            locateStrategy: 'css selector',
            elements: {
                viewDetails: "#viewUserDetails",
                createUser: "#create",
                editUser: "#edit",
                deleteUser: "#delete"
            }
        },
        detailsModal: {
            selector: '#viewUserDetailsModal',
            locateStrategy: 'css selector',
            elements: {
                modal: ".modal-content",
                userName: "#user_name",
                userEmail: "#user_email",
                gravatar: "#preview"
            },
            commands: [{
                getGravatar: function (callback) {
                    const detailsModal = this;
                    detailsModal.api.getAttribute('css selector', "#preview", "src", callback);
                    return detailsModal;
                },

                getUserName: function (callback) {
                    const detailsModal = this;
                    detailsModal.api.getText('css selector', "#user_name", callback);
                    return detailsModal;
                },

                getEmail: function (callback) {
                    const detailsModal = this;
                    detailsModal.api.getText('css selector', "#user_email", callback);
                    return detailsModal;
                },
            }]
        },
        deleteModal: {
            selector: '#deleteModal',
            locateStrategy: 'css selector',
            elements: {
                modal: ".modal-content",
                modalText: "#deleteMessage",
                confirmDeleteModal: "#modelDelButton",
                closeDeleteModal: "#modalCancelButton"
            },
            commands: [{
                getMessageText: function (callback) {
                    const page = this;
                    page.api.getText('css selector', "#deleteMessage", callback);
                    return page;
                }
            }]
        }
    }
};