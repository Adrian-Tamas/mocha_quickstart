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
 * Clicks an element using jquery selectors.
 *
 * h3 Examples:
 *
 *     browser.jqueryClick(".classname:first > input:checked")
 *     browser.jqueryClick("div:has(.classname):contains('something'):last")
 *
 * @param {String} selector - jQuery selector for the element
 * @param {Function} [callback] - function that will be called after the element is clicked
 */

module.exports.command = function(selector, callback) {
    selector = getMultipleSelectors(selector);
    let params = [selector];

    let execute = function(selector) {
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
        if (element.length) { element[0].click(); }
        return true;
    };
    let execcallback = () => {
        if (callback) {
            return callback.call(this, true);
        }
    };

    this.execute(execute, params, execcallback);

    return this;
};