const commands = {
    createReservation: function(reservation_details, confirm=true) {
        let page = this;
        page.select("@userSelect", reservation_details.user_id);
        page.select("@bookSelect", reservation_details.book_id);
        page.setValue("@reservationDate", reservation_details.reservation_date);
        page.setValue("@reservationExpirationDate", reservation_details.reservation_expiration_date);
        if(confirm) {
            page.click("@createReservationButton");
            return page.api.page.viewAllReservationsPage();
        } else {
            return page
        }
    },

    select: function(dropdown_selector, option_value) {
        let page = this;
        page.click(`${dropdown_selector}`,()=>{
            page.click(`option[value='${option_value}']`);
        });
        return page
    },

    isUserARequiredField: function (callback) {
        let page = this;
        page.getAttribute("@userSelect", "required", callback);
        return this;
    },

    isBookARequiredField: function (callback) {
        let page = this;
        page.getAttribute("@bookSelect", "required", callback);
        return this;
    },

    isReservationDateARequiredField: function (callback) {
        let page = this;
        page.getAttribute("@reservationDate", "required", callback);
        return this;
    },

    getFlashMessageText: function (callback) {
        const page = this;
        page.getText("@message", callback);
        return page;
    },

    getFieldErrorsMessage: async function (callback) {
        const page = this;
        await page.api.elements("css selector", ".invalid-feedback", callback);
        return page;
    },

    getAllOptionsForTheUserDropdown: async function (callback) {
        const page = this;
        await page.api.elements("css selector", "#user option", callback);
        return page;
    },

    getAllOptionsForTheBookDropdown: async function (callback) {
        const page = this;
        await page.api.elements("css selector", "#book option", callback);
        return page;
    },

    cancelCreate: function () {
        const page = this;
        page.click("@cancelReservationButton");
        return page.api.page.viewAllReservationsPage();
    },

    tryAndConfirmCreate: function ({expected_result} = {}) {
        const page = this;
        page.click("@createReservationButton");
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
        return global.ui_url + `/reservations/create`;
    },
    elements: {
        userSelect: '#user',
        bookSelect: '#book',
        reservationDate: '#reservation_date',
        reservationExpirationDate: '#reservation_expiration_date',
        createReservationButton: '#save',
        cancelReservationButton: '#back',
        message: '.alert',
    }
};