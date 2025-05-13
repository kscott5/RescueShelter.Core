'use strict'

const core = require("./dist/index.js");

module.exports = {
    server: core.server,
    services: core.services,
    createLogger: core.createLogger
};

exports.server = core.server;
exports.services = core.services;
exports.createLogger = core.createLogger;