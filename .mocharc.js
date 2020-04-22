'use strict';

// Here's a JavaScript-based config file.
// If you need conditional logic, you might want to use this type of config.
// Otherwise, JSON or YAML is recommended.

module.exports = {
    diff: true,
    extension: ['js'],
    opts: false,
    package: './package.json',
    reporter: 'mochawesome',
    slow: 75,
    timeout: 2000,
    'watch-files': ['lib/**/*.js', 'test/**/*.js'],
    'watch-ignore': ['lib/vendor'],
    file: ["config.js"]
};