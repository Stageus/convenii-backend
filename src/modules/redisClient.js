const Redis = require("ioredis");
const redisConfig = require("../config/redisConfig");

let redisClient = new Redis(redisConfig);

module.exports = redisClient;

