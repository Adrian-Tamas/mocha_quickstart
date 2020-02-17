# Description
This is a quick-start for javascript, mocha, chai and nightwatch-api automation framework. It has everything setup to just start writing tests

# How to use it
* if you just need a skeleton framework to start writing tests or learning automation create a branch from master and start using the framework
* if you want to see a demo of how tests can be written and how the framework works change to the demoLibraryApp branch

# About the framework
* it is currently setup for Rest Api testing and UI testing
* it is configured to run on a couple of different environments controlled through the nightwatch.conf.js and config.js files


# Libs used
* for api testing the _axios_ lib is used
* for the UI testing the _nightwatch-api_ lib has been integrated 

# Environment variables required
| variable key | variable description | possible values |
|--------------|----------------------|-----------------|
|NIGHTWATCH_ENV | the nightwatch env - browser | default, firefox, chrome, any other you setup |
|NODE_ENV | the env you want to run on | dev, test, any other you setup |

