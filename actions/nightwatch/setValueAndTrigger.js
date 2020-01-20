let getMultipleSelectors = function(selector) {
    if (Array.isArray(selector)) {
        let section_selector = selector[0].selector;
        let real_selector = selector[1].selector;
        return [section_selector,real_selector];
    } else {
        return selector;
    }
};

/**
 * Set a value on an `<input>` or a `<select>` and trigger a `change` event
 *
 * h3 Examples:
 *
 *     browser.setValueAndTrigger("#a-select-or-input", "some value")
 *
 * @param {String} selector - jQuery selector for the element
 * @param {String} value - value of the element to be set
 * @param {Function} [callback] - function that will be called after the change event is triggered
 */

module.exports.command = function (selector, value, callback) {
    selector = getMultipleSelectors(selector);
    let params = [selector, value];

    let execute = function(selector, value) {
        let getElementFromSelector = function(selector, options = {jquery: false}) {
            if (Array.isArray(selector)) {
                let section_selector = selector[0];
                selector = selector[1];

                if (options.jquery) {
                    return $(section_selector).find(selector);
                } else {
                    let section_element = document.querySelectorAll(section_selector);
                    if (!section_element.length) {
                        return null;
                    }

                    section_element = section_element[0];
                    if (options.parent_element) {
                        section_element = options.parent_element;
                    }

                    let elements = section_element.querySelectorAll(selector);
                    if (elements.length) {
                        if (options.return_all) {
                            return elements;
                        }
                        return elements[0];
                    }
                }
            } else {
                if (options.jquery) {
                    return $(selector);
                } else {
                    let parent_element = document;
                    if (options.parent_element) {
                        parent_element = options.parent_element;
                    }

                    let elements = parent_element.querySelectorAll(selector);
                    if (elements.length) {
                        if (options.return_all) {
                            return elements;
                        }
                        return elements[0];
                    }
                }
            }

            return null;
        };
        let element = getElementFromSelector(selector, {jquery: true});
        element.val(value);
        element.trigger("change");
        return true;
    };
    let execcallback = result => {
        if (callback) {
            return callback.call(this, result);
        }
    };

    return this.execute(execute, params, execcallback);
};
