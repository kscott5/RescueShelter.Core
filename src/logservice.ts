import * as winston from "winston";
import {DailyRotateFileTransportOptions} from "winston-daily-rotate-file";

const NODE_ENV = process.env?.NODE_ENV.toLowerCase() || "development";

export function createLogService(label: string) {    
    let logger = winston.createLogger();

    logger.clear();
    if(process.env?.NODE_ENV == 'development')
        logger.add(new winston.transports.Console);
    
    logger.add(
        new (winston.transports.DailyRotateFile)({
            json: true,
            dirname: process.env?.NODE_ENV_LOG_DIR || '.',
            filename: 'combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
          })
    );

    return logger;
}
