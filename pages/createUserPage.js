const commands = {
    createUser: function(user_details, confirm=true) {
        let page = this;
        page.setValue("@firstName", user_details.first_name);
        page.setValue("@lastName", user_details.last_name);
        page.setValue("@email", user_details.email);
        page.setValue("@confirmEmail", user_details.confirm_email);
        if(confirm) {
            page.click("@createUserButton");
            return page.api.page.viewAllUsersPage();
        } else {
            return page
        }
    },

    isFirstNameARequiredField: function (callback) {
        let page = this;
        page.getAttribute("@firstName", "required", callback);
        return this;
    },

    isLastNameARequiredField: function (callback) {
        let page = this;
        page.getAttribute("@lastName", "required", callback);
        return this;
    },

    isEmailARequiredField: function (callback) {
        let page = this;
        page.getAttribute("@email", "required", callback);
        return this;
    },

    isConfirmEmailARequiredField: function (callback) {
        let page = this;
        page.getAttribute("@confirmEmail", "required", callback);
        return this;
    },

    getFlashMessageText: function (callback) {
        const page = this;
        page.getText("@message", callback);
        return page;
    },

    getFieldErrorMessage: function (field, callback) {
        const page = this;
        page.getText(`#${field}_error`, callback);
        return page;
    },

    cancelCreate: function () {
        const page = this;
        page.click("@cancelUserButton");
        return page.api.page.viewAllUsersPage();
    },

    tryAndConfirmCreate: function ({expected_result} = {}) {
        const page = this;
        page.click("@createUserButton");
        if (expected_result) {
            return page.api.page.viewAllUsersPage();
        } else {
            return this;
        }
    }
};

module.exports = {
    commands: [commands],
    url: function () {
        return global.ui_url + `/users/create`;
    },
    elements: {
        firstName: '#first_name',
        lastName: '#last_name',
        email: "#email",
        confirmEmail: "#confirm_email",
        createUserButton: '#save',
        cancelUserButton: '#back',
        message: '.alert',
    }
};