const commands = {
    updateUserInfo: function(user_details, confirm_edit=true) {
        let page = this;
        page.clearValue("@userFirstName");
        page.setValue("@userFirstName", user_details.first_name);
        page.clearValue("@userLastName");
        page.setValue("@userLastName", user_details.last_name);
        if(confirm_edit) {
            page.click("@editUserButton");
            return page.api.page.viewAllUsersPage();
        } else {
            return page
        }
    },

    isFirstNameARequiredField: function (callback) {
        let page = this;
        page.getAttribute("@userFirstName", "required", callback);
        return this;
    },

    isLastNameARequiredField: function (callback) {
        let page = this;
        page.getAttribute("@userLastName", "required", callback);
        return this;
    },

    isIdAReadonlyField: function (callback) {
        let page = this;
        page.getAttribute("@userId", "readonly", callback);
        return this;
    },

    isEmailAReadonlyField: function (callback) {
        let page = this;
        page.getAttribute("@userEmail", "readonly", callback);
        return this;
    },

    getFlashMessageText: function (callback) {
        const page = this;
        page.getText("@message", callback);
        return page;
    },

    cancelEdit: function () {
        const page = this;
        page.click("@cancelUserButton");
        return page.api.page.viewAllBooksPage();
    },

    tryAndConfirmEdit: function ({expected_result=false} = {}) {
        const page = this;
        page.click("@editUserButton");
        if (expected_result) {
            return page.api.page.viewAllUsersPage();
        } else {
            return this;
        }
    },

    getFieldErrorMessage: function (field, callback) {
        const page = this;
        page.getText(`#${field}_error`, callback);
        return page;
    },
};

module.exports = {
    commands: [commands],
    url: function () {
        return global.ui_url + `/users/:user_id`;
    },
    elements: {
        userId: '#id',
        userFirstName: '#first_name',
        userLastName: '#last_name',
        userEmail: '#email',
        editUserButton: '#save',
        cancelUserButton: '#back',
        message: '.alert',
    }
};