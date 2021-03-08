import * as winston from "winston";
import DailyRotateFileTransportOptions from "winston-daily-rotate-file";

/**
 * 
 * @param {string} serviceName is a label identifier for a message
 * @returns {winston.Logger}
 */
export function createLogService(serviceName: string) : winston.Logger {    
    let logger = winston.createLogger({
        format: winston.format.combine(
            winston.format.label({label: serviceName, message: true}),
            winston.format.prettyPrint(),
            winston.format.timestamp(),            
            winston.format.json()
        ),
        transports: [
            new (winston.transports.DailyRotateFile)({
                json: true,
                dirname: process.env?.NODE_ENV_LOG_DIR || '.',
                filename: 'combined-%DATE%.log',
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d'
              })
        ]
    });

    logger.clear();
    if(process.env?.NODE_ENV == 'development')
        logger.add(new winston.transports.Console);
    
    logger.add(new winston.transports.File);

    return logger;
}
