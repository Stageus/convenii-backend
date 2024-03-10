const router = require("express").Router();
const jwt = require("jsonwebtoken");
const redis = require("redis").createClient();
const uuid = require("uuid");

const checkCondition = require("../modules/checkCondition")
router.post("/", checkCondition("email",emailPattern),checkCondition("pw",pwPattern),checkCondition("nickname",nicknamePattern),checkSame("pw","pwSame"),async(req,res,next)=>{

})