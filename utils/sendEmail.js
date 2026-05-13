import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, text) => {
  await resend.emails.send({
    from: "email@flexi4u.com",
    to,
    subject,
    text,
  });
};