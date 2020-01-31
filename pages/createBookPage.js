const commands = {
    createBook: function(book_details, confirm=true) {
        let page = this;
        page.setValue("@bookName", book_details.name);
        page.setValue("@bookAuthor", book_details.author);
        page.setValue("@bookDescription", book_details.description);
        page.setValue("@bookCover", book_details.cover);
        if(confirm) {
            page.click("@createBookButton");
            return page.api.page.viewAllBooksPage();
        } else {
            return page
        }
    },

    isNameARequiredField: function (callback) {
        let page = this;
        page.getAttribute("@bookName", "required", callback);
        return this;
    },

    isAuthorARequiredField: function (callback) {
        let page = this;
        page.getAttribute("@bookAuthor", "required", callback);
        return this;
    },

    getFlashMessageText: function (callback) {
        const page = this;
        page.getText("@message", callback);
        return page;
    },

    getFieldErrorMessage: function (callback) {
        const page = this;
        page.getText(".invalid-feedback", callback);
        return page;
    },

    cancelCreate: function () {
        const page = this;
        page.click("@cancelBookButton");
        return page.api.page.viewAllBooksPage();
    },

    tryAndConfirmCreate: function ({expected_result} = {}) {
        const page = this;
        page.click("@createBookButton");
        if (expected_result) {
            return page.api.page.viewAllBooksPage();
        } else {
            return this;
        }
    }
};

module.exports = {
    commands: [commands],
    url: function () {
        return global.ui_url + `/books/create`;
    },
    elements: {
        bookName: '#name',
        bookAuthor: '#author',
        bookDescription: '#description',
        bookCover: '#cover',
        createBookButton: '#save',
        cancelBookButton: '#back',
        message: '.alert',
    }
};