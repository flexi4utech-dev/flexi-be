import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, text) => {
  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "no-reply@flexi4u.com",
      to: to, // ✅ MUST be string
      subject: subject,
      text: text,
    });

    console.log("EMAIL SENT:", response);

    return response;
  } catch (err) {
    console.log("EMAIL ERROR:", err);
    throw err;
  }
};