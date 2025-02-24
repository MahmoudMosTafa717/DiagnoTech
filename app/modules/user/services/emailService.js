const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * @param {string} email
 * @returns {Promise<string>}
 */
const sendPasswordResetCode = async (email) => {
  try {
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedCode = await bcrypt.hash(resetCode, 10);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
    });

    console.log(`OTP sent to ${email}: ${resetCode}`);
    return hashedCode;
  } catch (error) {
    console.error("Email Sending Error:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = {
  sendPasswordResetCode,
};
