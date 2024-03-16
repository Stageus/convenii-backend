const nodemailer = require("nodemailer");
const mailerConfig = require("../config/mailerConfig");

async function sendVerificationEmail(email, verificationCode) {
    const transporter = nodemailer.createTransport(mailerConfig);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "이메일 인증",
        text: `인증번호 : ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = sendVerificationEmail;