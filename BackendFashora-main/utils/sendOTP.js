const nodemailer = require("nodemailer");

async function sendOTP(email, otp) {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"TriaFash" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    });

    console.log("OTP sent to", email);
    return true;
  } catch (err) {
    console.error("Failed to send OTP:", err);
    // THROW an error so backend can respond with JSON
    throw new Error("Failed to send OTP email. Please check your email settings.");
  }
}

module.exports = sendOTP;
