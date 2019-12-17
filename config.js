const environment = process.env.NODE_ENV || 'dev';
const config = require("./config.json");
global.backend_url = config[environment]["backend_url"];
global.ui_url = config[environment]["ui_url"];