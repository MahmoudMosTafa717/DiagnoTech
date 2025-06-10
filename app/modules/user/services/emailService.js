// const nodemailer = require("nodemailer");
// const bcrypt = require("bcryptjs");
// const generateResetEmail = require("../../utils/emailTemplate"); // Import HTML email template
// require("dotenv").config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

// /**
//  * @param {string} email
//  * @returns {Promise<string>}
//  */
// const sendPasswordResetCode = async (email) => {
//   try {
//     const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
//     const hashedCode = await bcrypt.hash(resetCode, 10);

//     // Use the HTML email template
//     const emailContent = generateResetEmail(resetCode);

//     await transporter.sendMail({
//       from: `"YourApp Support" <${process.env.GMAIL_USER}>`,
//       to: email,
//       subject: "Reset Your Password",
//       html: emailContent, // Use HTML instead of plain text
//     });

//     console.log(`OTP sent to ${email}: ${resetCode}`);
//     return hashedCode;
//   } catch (error) {
//     console.error("Email Sending Error:", error);
//     throw new Error("Failed to send email");
//   }
// };

// module.exports = {
//   sendPasswordResetCode,
// };

const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcryptjs");
const generateResetEmail = require("../../utils/emailTemplate");
require("dotenv").config();

// const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * @param {string} email
 * @returns {Promise<string>}
 */
const sendPasswordResetCode = async (email) => {
  try {
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(resetCode, 10);
    const emailContent = generateResetEmail(resetCode);

    const msg = {
      to: email,
      from: "diadiagnotech123@gmail.com",
      subject: "Reset Your Password",
      html: emailContent,
    };

    await sgMail.send(msg);

    console.log(`Password reset email sent to ${email}.`);
    return hashedCode;
  } catch (error) {
    console.error("Email Sending Error:", error);

    if (error.response) {
      console.error(error.response.body);
    }

    throw new Error("Failed to send email");
  }
};

module.exports = {
  sendPasswordResetCode,
};
