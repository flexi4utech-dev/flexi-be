import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_EMAIL",
    pass: "APP_PASSWORD",
  },
});

export const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    to,
    subject,
    text,
  });
};