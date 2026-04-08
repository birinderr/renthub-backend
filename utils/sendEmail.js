import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("Loading email configuration...");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Loaded" : "Missing");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP connection when server starts
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

export const sendOTPEmail = async (email, otp) => {
  try {
    console.log("Preparing OTP email...");
    console.log("Recipient:", email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your RentHub OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    console.log("Sending email...");

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.response);

    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Error sending OTP");
  }
};
