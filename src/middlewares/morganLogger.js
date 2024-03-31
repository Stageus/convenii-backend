const morgan = require("morgan");
const logger = require("../modules/logger");

const stream = {
    write: (message) => {
        if (parseInt(message.trim().split(" ")[8]) >= 400) {
            logger.error(message);
        } else {
            logger.info(message);
        }

        console.log(message);
    },
};
const skip = (_, res) => {
    return res.ststusCode < 400;
};

module.exports = morgan("combined", { stream, skip });
