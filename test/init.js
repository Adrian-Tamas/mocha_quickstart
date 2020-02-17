const {
    client,
    createSession,
    closeSession,
    startWebDriver,
    stopWebDriver,
    getNewScreenshots
} = require('nightwatch-api');

before(async () => {
    await startWebDriver({env: process.env.NIGHTWATCH_ENV || 'firefox'});
});

after(async () => {
    await stopWebDriver();
});