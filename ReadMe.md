# Description
This is a quick-start for javascript, mocha, chai and nightwatch-api automation framework. It has everything setup to just start writing tests

# How to use it
* if you just need a skeleton framework to start writing tests or learning automation create a branch from master and start using the framework
* if you want to see a demo of how tests can be written and how the framework works change to the demoLibraryApp branch:
    * app used for the demo:
        * backend: https://github.com/Adrian-Tamas/PythonLibraryBackend
        * frontend: https://github.com/Adrian-Tamas/PythonLibaryFrontend

# About the framework
* it is currently setup for Rest Api testing and UI testing
* it is configured to run on a couple of different environments controlled through the nightwatch.conf.js and config.js files
* the environment links to execute against are controlled through the config.json file

# Libs used
* for api testing the _axios_ lib is used
* for the UI testing the _nightwatch-api_ lib has been integrated 

# Environment variables required
| variable key | variable description | possible values |
|--------------|----------------------|-----------------|
|NIGHTWATCH_ENV | the nightwatch env - browser | default, firefox, chrome, any other you setup |
|NODE_ENV | the env you want to run on | dev, test, any other you setup |

# Using the framework
* install npm on your local machine
* clone the repository, rename it as needed
* remove the .git folder and initialize a new git repo for your needs
* create your work branch from master
* from a console go to the project folder and run `npm install` to install all dependencies
* run `npm update` to update to the latest versions of the libs (especially needed for the gecko and chrome drivers)
* update the config.json with the correct urls for your apps and start writing your tests

# Running your tests
* set the environment variables to the values you want or leave them as default
* run `npm test` to execute your tests
* setup any other stage in the package.json file as you need to
