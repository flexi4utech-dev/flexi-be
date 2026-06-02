import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email using the Resend API.
 * 
 * @param {string} to - Recipient email address (must be a string).
 * @param {string} subject - Email subject line.
 * @param {string} text - Plain text body of the email.
 * @param {string} [html] - (Optional) Rich HTML body of the email.
 * @returns {Promise<Object>} - The response object from Resend.
 */
export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const senderEmail = process.env.FROM_EMAIL || "no-reply@flexi4u.com";
    const senderName = process.env.FROM_NAME || "Flexi4U";
    const fromAddress = `${senderName} <${senderEmail}>`;

    const emailPayload = {
      from: fromAddress,
      to: to,
      subject: subject,
      text: text,
      reply_to: process.env.REPLY_TO_EMAIL || "support@flexi4u.com",
    };

    if (html) {
      emailPayload.html = html;
    }

    const response = await resend.emails.send(emailPayload);

    console.log("EMAIL SENT:", response);

    return response;
  } catch (err) {
    console.log("EMAIL ERROR:", err);
    throw err;
  }
};