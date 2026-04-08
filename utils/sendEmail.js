import dotenv from "dotenv";

dotenv.config();

console.log("Loading OTP configuration...");
console.log("DEV_OTP:", process.env.DEV_OTP ? "Loaded" : "Missing");

export const sendOTPEmail = async (email, otp) => {
  try {
    console.log("OTP requested for:", email);

    // Use OTP from environment variable if available
    const finalOTP = process.env.DEV_OTP || otp;

    console.log("OTP (for testing):", finalOTP);

    // No email sending during development
    return true;

  } catch (error) {
    console.error("Error handling OTP:", error);
    throw new Error("Error processing OTP");
  }
};
