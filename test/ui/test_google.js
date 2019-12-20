const {
    createSession,
    closeSession,
    startWebDriver,
    stopWebDriver,
    getNewScreenshots
} = require('nightwatch-api');
const client = require('nightwatch-api').client;

describe('test', function () {
    this.timeout(60000);
    before(async () => {
        await startWebDriver({ env: process.env.NIGHTWATCH_ENV || 'firefox' });
        await createSession({ env: process.env.NIGHTWATCH_ENV || 'firefox' });
    });

    after(async () => {
        await closeSession();
        await stopWebDriver();
    });

    it('test', async function () {
        await client.url('http://google.com').waitForElementVisible('body', 1000);
        let bodyId;
        await client.getAttribute(
            'body',
            'id',
            ({ value }) => {
                if (value.error) {
                    throw Error(value.error);
                }

                bodyId = value;
            }
        );
        await client.assert.equal('gsr', bodyId);
    });
});