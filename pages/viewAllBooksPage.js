

const commands = {

    removeFade: async function() {
        const page = this;
        await page.api.execute("$('#viewBookDetails').removeClass('fade')");
        return page;
    },

    search: function(searchTerm) {
        const page = this;
        page.waitForElementVisible("@table", 30000)
            .clearValue('@searchField')
            .setValue('@searchField', searchTerm);
        return page;
    },

    getBookId: async function(searchTerm, callback) {
        const page = this;
        page.waitForElementVisible("@table", 30000)
            .setValue('@searchField', searchTerm);
        await page.api.waitForCondition(`return $(".clickable-row:not([style*='display: none']").first().text().includes("${searchTerm}");`);
        page.getAttribute("css selector", ".clickable-row:not([style*='display: none'])", "id", callback);
        return page;
    },

    findBookInPageById: function (id, callback) {
        const page = this;
        page.api.getText("css selector",`.clickable-row[data-id="${id}"]`, callback);
        return page;
    },

    getNumberOfDisplayedRows: function (callback) {
        const page = this;
        page.api.elements("css selector",".clickable-row:not([style*='display: none'])", callback);
        return page;
    },

    openBookDetails: async function (id) {
        const page = this;
        await page.api.execute("$('#viewBookDetails').removeClass('fade')");
        page.api.jqueryClick(`.clickable-row[data-id="${id}"]`);
        page.section.menu
            .click("@viewDetails");
        page.section.detailsModal
            .waitForElementVisible("@modal", 30000);
        return page;
    },

    openBookDeleteModal: async function (id) {
        const page = this;
        await page.api.execute("$('#deleteModal').removeClass('fade')");
        page.api.jqueryClick(`.clickable-row[data-id="${id}"]`);
        page.section.menu
            .click("@deleteBook");
        page.section.deleteModal
            .waitForElementVisible("@modal", 30000);
        return page;
    },

    confirmBookDelete: async function () {
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

    cancelBookDelete: async function () {
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

    closeBookDelete: async function () {
        const page = this;
        await page.api.execute("$.find('#deleteModal .close')[0].click()");
        await page
            .section
            .deleteModal
            .waitForElementNotVisible("@modal", 30000);
        return page;
    },

    closeModalFromCancelButton: async function () {
        const page = this;
        await page.api.execute("$.find('#viewBookCancelButton')[0].click()");
        return page;
    },

    closeModalFromXButton: async function () {
        const page = this;
        await page.api.execute("$.find('#viewBookDetails .close')[0].click()");
        return page;
    },

    startBookEdit: function(id) {
        const context = this;
        context.api.jqueryClick(`.clickable-row[data-id="${id}"]`);
        context.section.menu
            .click("@editBook");
        return context.api.page.editBookPage();
    },

    startCreateBook: function() {
        const context = this;
        context.section.menu
            .click("@createBook");
        return context.api.page.createBookPage();
    },

    getFlashMessageText: function (callback) {
        const page = this;
        page.getText("@message", callback);
        return page;
    }
};

module.exports = {
    commands: [commands],
    url: function () {
        return global.ui_url + "/books";
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
                viewDetails: "#viewDetails",
                createBook: "#create",
                editBook: "#edit",
                deleteBook: "#delete"
            }
        },
        detailsModal: {
            selector: '#viewBookDetails',
            locateStrategy: 'css selector',
            elements: {
                modal: ".modal-content",
                cover: "#preview",
                bookName: "#book_name",
                bookAuthor: "#book_author",
                description: "#book_description",
                closeBookModal: "#viewBookCancelButton"
            },
            commands: [{
                getCoverUrl: function (callback) {
                    const detailsModal = this;
                    detailsModal.api.getAttribute('css selector', "#preview", "src", callback);
                    return detailsModal;
                },

                getBookName: function (callback) {
                    const page = this;
                    page.api.getText('css selector', "#book_name", callback);
                    return page;
                },

                getAuthorName: function (callback) {
                    const page = this;
                    page.api.getText('css selector',"#book_author", callback);
                    return page;
                },

                getDescription: function (callback) {
                    const page = this;
                    page.api.getText('css selector',"#book_description", callback);
                    return page;
                },
            },]
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
                    page.api.getText('css selector',"#deleteMessage", callback);
                    return page;
                }
            }]
        }
    }
};