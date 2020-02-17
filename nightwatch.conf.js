const chromeDriver = require("chromedriver");
const geckoDriver = require("geckodriver");

module.exports = {
    src_folders: ['tests'],
    page_objects_path: 'pages',
    custom_commands_path: "actions/nightwatch",
    // custom_assertions_path: "assertions",
    // globals_path: 'globals.js',
    test_settings: {
        chrome: {
            webdriver: {
                start_process: true,
                server_path: chromeDriver.path,
                port: 4444,
                cli_args: ['--port=4444'],
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
        default: {
            webdriver: {
                start_process: false,
                server_path: geckoDriver.path,
                port: 4446,
                cli_args: ['--port=4446', "-vv"],
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
                elementScrollBehavior: 1,
                firefoxOptions: {
                    args: [
                        // '-headless',
                        '--verbose',
                        "--log debug"
                    ],
                }
            }
        },
        firefox: {
            webdriver: {
                start_process: true,
                server_path: geckoDriver.path,
                port: 4446,
                cli_args: ['--port=4446', "-vv"],
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
                elementScrollBehavior: 1,
                firefoxOptions: {
                    args: [
                        // '-headless',
                        '--verbose',
                        "--log debug"
                    ],
                }
            }
        },
    }
};