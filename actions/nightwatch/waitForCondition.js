const events = require("events");

/**
 *The waitForCondition command receives a condition to check for,
 * waits for a maximum time before timing out, and polls at a specified time interval.
 * The condition returns either as a success or a timeout.
 *
 * h3 Examples:
 *
 *     browser.waitForCondition('return $.active === 0;', 8000);
 *     browser.waitForCondition('return $.active; === 0;', 8000, "my custom message");
 *
 * @param {function} [condition] - the condition to check
 * @param {Integer} [timeoutInMilliseconds] - timeout of this wait commands in milliseconds
 * @param {String} [message] - message to display
 */

class WaitForCondition extends events.EventEmitter {

    constructor() {
        super();
        this.timeoutRetryInMilliseconds = this.api.globals.waitForConditionPollInterval || 100;
        this.defaultTimeoutInMilliseconds = this.api.globals.waitForConditionTimeout || 5000;
        this.startTimeInMilliseconds = null;
    }

    command(condition, timeoutInMilliseconds, message) {
        this.condition = condition;
        this.startTimeInMilliseconds = new Date().getTime();

        if (typeof timeoutInMilliseconds !== 'number') {
            timeoutInMilliseconds = this.defaultTimeoutInMilliseconds;
        }

        if (message && typeof message !== 'string') {
            this.emit('error', "defaultMessage is not a string");
            return;
        }

        this.check((condition, loadedTimeInMilliseconds, conditionResult) => {
            let messageToShow;
            if (message) {
                messageToShow = message;
            } else if (conditionResult) {
                messageToShow = `Condition was satisfied after ${loadedTimeInMilliseconds - this.startTimeInMilliseconds} ms.`;
            } else {
                messageToShow = `Timed out while waiting for condition after ${timeoutInMilliseconds} ms.`;
            }
            this.client.api.assert.equal(true, conditionResult, messageToShow);
            return this.emit('complete');
        }, timeoutInMilliseconds);
    }

    check(callback, maxTimeInMilliseconds) {
        return this.api.execute(this.condition, [], (result) => {
            let now = new Date().getTime();
            if (result.value === true) {
                return callback(this.condition, now, result.value);
            } else if (now - this.startTimeInMilliseconds < maxTimeInMilliseconds) {
                return setTimeout(() => {
                    this.check(callback, maxTimeInMilliseconds);
                }, this.timeoutRetryInMilliseconds);
            } else {
                return callback(this.condition, now, result.value);
            }
        });
    }
}

module.exports = WaitForCondition;