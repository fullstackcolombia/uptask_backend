import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const config = () => {
  return {
    host: process.env.MAIL_HOST,
    port: +process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  };
};

// Looking to send emails in production? Check out our Email API/SMTP product!
export const transporter = nodemailer.createTransport(config());
