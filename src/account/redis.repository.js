const redisClient = require("../util/module/redisClient");
const CheckEmailVerificationDao = require("./dao/check-emailVerification.dao");
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
    // return await redisClient.get(`verifiedEmails:${getEmailVerificationDao.email}`);
    return await redisClient.get(`emailVerification:${getEmailVerificationDao.email}`);
};

/**
 *
 * @param {CheckEmailVerificationDao} checkEmailVerificationDao
 * @returns {Promise<string | null>}
 */
const checkEmailVerification = async (checkEmailVerificationDao) => {
    return await redisClient.get(`verifiedEmails:${checkEmailVerificationDao.email}`);
};

module.exports = {
    setEmailWithCode,
    setEmailVerified,
    getEmailVerification,
};
