const redisClient = require("../util/module/redisClient");
const GetEmailVerificationDao = require("./dao/get-emailVerification.dao");
const SetEmailVerifiedDao = require("./dao/set-emailVerifiedDao");
const SetEmailWithCodeDao = require("./dao/set-emailWithCode.dao");

/**
 *
 * @param {SetEmailWithCodeDao} setEmailWithCodeDao
 * @returns {Promise<'OK' | null>}
 */
const setEmailWithCode = async (setEmailWithCodeDao) => {
    return await redisClient.set(`emailVerification:${setEmailWithCodeDao.email}`, setEmailWithCodeDao.verificationCode, "EX", 180);
};

/**
 *
 * @param {SetEmailVerifiedDao} setEmailVerifiedDao
 * @returns {Promise<'OK' | null>}
 */
const setEmailVerified = async (setEmailVerifiedDao) => {
    return await redisClient.set(`verifiedEmails:${setEmailVerifiedDao.email}`, "verified", "EX", 1800);
};

/**
 *
 * @param {GetEmailVerificationDao} getEmailVerificationDao
 * @returns {Promise<string | null>}
 */
const getEmailVerification = async (getEmailVerificationDao) => {
    return await redisClient.get(`verifiedEmails:${getEmailVerificationDao.email}`);
};

module.exports = {
    setEmailWithCode,
    setEmailVerified,
    getEmailVerification,
};
