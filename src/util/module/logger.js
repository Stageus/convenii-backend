const winston = require("winston");
const winstonDaily = require("winston-daily-rotate-file");
const { combine, timestamp, label, printf } = winston.format;
const path = require("path");
const logDir = path.join(__dirname, "../../../logs");
const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

module.exports = winston.createLogger({
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), label({ label: "convenii" }), logFormat),
    transports: [
        new winstonDaily({
            level: "info",
            datePattern: "YYYY-MM-DD",
            dirname: logDir,
            filename: `%DATE%.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),

        new winstonDaily({
            level: "error",
            datePattern: "YYYY-MM-DD",
            dirname: logDir + "/error",
            filename: `%DATE%.error.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),
    ],
});
