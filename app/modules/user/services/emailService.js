const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// إعداد Nodemailer مع Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // بريد Gmail
    pass: process.env.GMAIL_PASS, // استخدم "App Password" هنا
  },
});

/**
 * إرسال كود إعادة تعيين كلمة المرور عبر الإيميل
 * @param {string} email - البريد الإلكتروني للمستخدم
 * @returns {Promise<string>} - الكود المشفر الذي تم إرساله
 */
const sendPasswordResetCode = async (email) => {
  try {
    // إنشاء كود مكون من 6 أرقام
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // تشفير الكود قبل تخزينه
    const hashedCode = await bcrypt.hash(resetCode, 10);

    // إرسال الإيميل
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
    });

    console.log(`✅ OTP sent to ${email}: ${resetCode}`);
    return hashedCode;
  } catch (error) {
    console.error("❌ Email Sending Error:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = {
  sendPasswordResetCode,
};
