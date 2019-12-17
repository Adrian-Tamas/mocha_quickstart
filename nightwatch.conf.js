const chromeDriver = require("chromedriver");
const geckoDriver = require("geckodriver");

module.exports = {
    src_folders: ['tests'],
    page_objects_path: 'pages',
    custom_commands_path: "actions/nightwatch",
    // custom_assertions_path: "assertions",
    // globals_path: 'globals.js',
    test_settings: {
        default: {
            webdriver: {
                start_process: true,
                server_path: chromeDriver.path,
                port: 9515,
                cli_args: ['--port=9515'],
                request_timeout_options: {
                    timeout: 60000,
                    retry_attempts: 2
                },
            },
            desiredCapabilities: {
                browserName: 'chrome',
                javascriptEnabled: true,
                acceptSslCerts: true,
                chromeOptions: {
                    args : ["--no-sandbox"],
                    w3c: false
                }
            }
        },
        firefox: {
            webdriver: {
                start_process: true,
                server_path: geckoDriver.path,
                port: 4446,
                cli_args: ['--port=4446'],
                request_timeout_options: {
                    timeout: 60000,
                    retry_attempts: 2
                },
            },
            desiredCapabilities: {
                browserName: 'firefox',
                javascriptEnabled: true,
                acceptSslCerts: true,
                marionette:true,
                acceptInsecureCerts: true,
                firefoxOptions: {
                    args: [
                        // '-headless',
                        '-verbose'
                    ],
                }
            }
        },
    }
};