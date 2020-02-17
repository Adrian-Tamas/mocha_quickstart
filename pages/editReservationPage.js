const commands = {
    updateReservationInfo: function(reservation_details, confirm_edit=true) {
        let page = this;
        page.clearValue("@reservationDate");
        page.setValue("@reservationDate", reservation_details.reservation_date);
        page.clearValue("@reservationExpirationDate");
        page.setValue("@reservationExpirationDate", reservation_details.reservation_expiration_date);
        if(confirm_edit) {
            page.click("@editReservationButton");
            return page.api.page.viewAllReservationsPage();
        } else {
            return page
        }
    },

    clearExpirationDate: function() {
        let page = this;
        page.clearValue("@reservationExpirationDate");
        return page;
    },

    isDateARequiredField: function (callback) {
        let page = this;
        page.getAttribute("@reservationDate", "required", callback);
        return this;
    },

    isUserAReadonlyField: function (callback) {
        let page = this;
        page.getAttribute("@reservationUser", "readonly", callback);
        return this;
    },

    isBookAReadonlyField: function (callback) {
        let page = this;
        page.getAttribute("@reservationBook", "readonly", callback);
        return this;
    },

    getFlashMessageText: function (callback) {
        const page = this;
        page.getText("@message", callback);
        return page;
    },

    cancelEdit: function () {
        const page = this;
        page.click("@cancelReservationButton");
        return page.api.page.viewAllReservationsPage();
    },

    tryAndConfirmCreate: function ({expected_result} = {}) {
        const page = this;
        page.click("@editReservationButton");
        if (expected_result) {
            return page.api.page.viewAllReservationsPage();
        } else {
            return this;
        }
    },

    getFieldErrorsMessage: async function (callback) {
        const page = this;
        await page.api.elements("css selector", ".invalid-feedback", callback);
        return page;
    },
};

module.exports = {
    commands: [commands],
    url: function () {
        return global.ui_url + `/reservations/user/:user_id/book/:book_id`;
    },
    elements: {
        reservationUser: '#user',
        reservationBook: '#book',
        reservationDate: '#reservation_date',
        reservationExpirationDate: '#reservation_expiration_date',
        editReservationButton: '#save',
        cancelReservationButton: '#back',
        message: '.alert',
    }
};