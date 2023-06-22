const path = require('path');
const log4js = require("log4js");
const protractorAppender = require('log4js-protractor-appender');

const { PRINT_TO_FILE, PRINT_TO_CONSOLE, LOGGER_FILE_PATH } = require("../config");
const fs = require('fs');

log4js.addLayout('protractor', protractorAppender.protractor);

if (!PRINT_TO_FILE && !PRINT_TO_CONSOLE) {
    PRINT_TO_FILE = true; // At least one of them should be true
}

if (PRINT_TO_FILE && LOGGER_FILE_PATH && !fs.existsSync(path.join(LOGGER_FILE_PATH, 'zaposloni'))) {
    fs.mkdirSync(path.join(LOGGER_FILE_PATH, 'zaposloni'));
}

log4js.addLayout('json', () => logEvent => {
    let retObj = {
        level: logEvent.level.levelStr,
        timestamp: logEvent.startTime
    }
    if (retObj.level === 'ERROR') {
        retObj.message = logEvent.data[0].message;
        retObj.stackTrace = logEvent.data[0].stack;
        return JSON.stringify(retObj) + '\n';
    }
    if (logEvent.data.length === 1) {
        if (typeof logEvent.data[0] === 'string' && logEvent.data[0].startsWith('Executing')) {
            retObj.message = 'QUERY';
            retObj.sql = logEvent.data[0].split(": ", 2)[1];
            return JSON.stringify(retObj) + '\n';
        }
        retObj.message = logEvent.data[0];
        return JSON.stringify(retObj) + '\n';
    }
    if (logEvent.data.length === 2) {
        retObj.message = logEvent.data[0];
        retObj.data = logEvent.data[1];
        return JSON.stringify(retObj) + '\n';
    }

    return JSON.stringify(logEvent) + '\n';
});

const logConfig = {
    appenders: {},
    categories: { default: { appenders: [], level: "debug" } }
};

if (PRINT_TO_CONSOLE) {
    logConfig.appenders['toConsole'] = { type: 'stdout' };
    logConfig.appenders['toConsole'].layout = { type: 'json' }
    logConfig.categories.default.appenders.push('toConsole');
}

if (PRINT_TO_FILE) {
    logConfig.appenders['toFile'] = { type: "dateFile", layout: { type: 'json' }, filename: `${path.join(LOGGER_FILE_PATH, 'zaposloni', 'combined.log')}`, pattern: '.yyyy-MM-dd', maxLogSize: 268435456, compress: true };
    logConfig.appenders['error'] = { type: "dateFile", layout: { type: 'json' }, filename: `${path.join(LOGGER_FILE_PATH, 'zaposloni', 'error.log')}`, pattern: '.yyyy-MM-dd', maxLogSize: 268435456, compress: true };
    logConfig.appenders['errorFilter'] = { type: "logLevelFilter", appender: 'error', level: 'error' };
    logConfig.categories.default.appenders.push('toFile');
    logConfig.categories.default.appenders.push('errorFilter');
}

log4js.configure(logConfig);
const logger = log4js.getLogger();
module.exports = logger;
