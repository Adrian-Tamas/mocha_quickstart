const commands = {
    updateBookInfo: function(book_details) {
        let page = this;
        page.clearValue("@bookName");
        page.setValue("@bookName", book_details.name);
        page.clearValue("@bookAuthor");
        page.setValue("@bookAuthor", book_details.author);
        page.clearValue("@bookDescription");
        page.setValue("@bookDescription", book_details.description);
        page.clearValue("@bookCover");
        page.setValue("@bookCover", book_details.cover);
        page.click("@editBookButton");
        return page.api.page.viewAllBooksPage();
    },

    removeDescription: function () {
        let page = this;
        page.clearValue("@bookDescription");
        page.click("@editBookButton");
        return page.api.page.viewAllBooksPage();
    },

    removeCoverLink: function () {
        let page = this;
        page.clearValue("@bookCover");
        page.click("@editBookButton");
        return page.api.page.viewAllBooksPage();
    }
};

module.exports = {
    commands: [commands],
    url: function () {
        return global.ui_url + `/books/:book_id`;
    },
    elements: {
        bookId: '#id',
        bookName: '#name',
        bookAuthor: '#author',
        bookDescription: '#description',
        bookCover: '#cover',
        editBookButton: '#save',
        cancelBookButton: '#back'
    }
};