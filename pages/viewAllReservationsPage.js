const commands = {
    findReservationInPageById: function (id, callback) {
        const page = this;
        page.api.getText("css selector",`.clickable-reservation-row[id="${id}"]:not([style*='display: none']`, callback);
        return page;
    },

    search: function(searchTerm) {
        const page = this;
        page.waitForElementVisible("@table", 30000)
            .clearValue('@searchField')
            .setValue('@searchField', searchTerm);
        return page;
    },

    getDisplayedRows: async function(callback) {
        const page = this;
        await page.api.elements("css selector", ".clickable-reservation-row:not([style*='display: none']",  callback);
        return page;
    },

    startCreateReservation: function() {
        const context = this;
        context.section.menu
            .click("@createReservation");
        return context.api.page.createReservationPage();
    },

    getReservationId: async function(searchTerm, callback) {
        const page = this;
        page.waitForElementVisible("@table", 30000)
            .setValue('@searchField', searchTerm);
        await page.api.waitForCondition(`return $(".clickable-reservation-row:not([style*='display: none']").first().text().includes("${searchTerm}");`);
        page.getAttribute("css selector", ".clickable-reservation-row:not([style*='display: none'])", "id", callback);
        return page;
    },


    getFlashMessageText: function (callback) {
        const page = this;
        page.getText("@message", callback);
        return page;
    },

    startReservationEdit: function(id) {
        const context = this;
        context.api.jqueryClick(`.clickable-reservation-row[id="${id}"]`);
        context.section.menu
            .click("@editReservation");
        return context.api.page.editReservationPage();
    },

    openReservationDeleteModal: async function (id) {
        const page = this;
        await page.api.execute("$('#deleteReservationModal').removeClass('fade')");
        page.api.jqueryClick(`.clickable-reservation-row[id="${id}"]`);
        page.section.menu
            .click("@deleteReservation");
        page.section.deleteModal
            .waitForElementVisible("@modal", 30000);
        return page;
    },

    confirmReservationDelete: async function () {
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

    cancelReservationDelete: async function () {
        const page = this;
        await page.api.jqueryClick("#modalCancelReservationButton");
        await page
            .section
            .deleteModal
            .waitForElementNotVisible("@modal", 30000);
        return page;
    },

    closeReservationDeleteModal: async function () {
        const page = this;
        await page.api.execute("$.find('#deleteReservationModal .close')[0].click()");
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
        return global.ui_url + "/reservations";
    },
    elements: {
        table: '#table',
        searchField: '#searchField',
        tableRow: '.clickable-reservation-row',
        message: '.alert',
    },
    sections: {
        menu: {
            selector: '.btn-group',
            locateStrategy: 'css selector',
            elements: {
                createReservation: "#create-reservation",
                editReservation: "#edit-reservation",
                deleteReservation: "#delete-reservation"
            }
        },
        deleteModal: {
            selector: '#deleteReservationModal',
            locateStrategy: 'css selector',
            elements: {
                modal: ".modal-content",
                modalText: "#deleteReservationMessage",
                confirmDeleteModal: "#modelDelReservationButton",
                closeDeleteModal: "#modalCancelReservationButton"
            },
            commands: [{
                getMessageText: function (callback) {
                    const page = this;
                    page.api.getText('css selector', "#deleteReservationMessage", callback);
                    return page;
                }
            }]
        }
    }
};