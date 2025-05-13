const winston = require("winston");
require("winston-daily-rotate-file");

/**
 * 
 * @param {string} serviceName is a label identifier for a message
 * @returns {winston.Logger}
 */
function createLogService(serviceName: string)  {    
    let transports = [
        new winston.transports.DailyRotateFile({
            json: true,
            dirname: process.env?.RESCUE_SHELTER_LOG_DIR || '.',
            filename: 'combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'})
    ];

    // development allow stdout on console
    if((process.env?.NODE_ENV || 'production') != 'prodution')
        transports.push(new winston.transports.Console());

    // set log level production info only and others debug
    let logLevel = (process.env?.NODE_ENV == 'development')? 'debug' : 'info';

    let logger = winston.createLogger({
        level: logLevel,
        format: winston.format.combine(
            winston.format.label({label: serviceName, message: true}),
            winston.format.prettyPrint(),
            winston.format.timestamp(),            
            winston.format.json()
        ),
        transports: transports
    });

    return logger;
}

export {
    createLogService
};