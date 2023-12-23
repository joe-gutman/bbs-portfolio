// Import nodemailer
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a function to send a test email
async function sendTestEmail() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
    from: `"No Reply" <${process.env.NO_REPLY_EMAIL}>`,
    to: 'jddg5wa@gmail.com',
    subject: 'Verify your email address',
    html: `
        <div style="background-color: #f6f6f6; padding: 20px; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 5px; padding: 20px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                <h1 style="color: #24292e; font-size: 24px; font-weight: bold; border-bottom: 1px solid #e1e4e8; padding-bottom: 20px;">Welcome to Brown Box Studio!</h1>
                <p style="color: #586069; font-size: 18px;">To verify your email address, please click the button below:</p>
                <a href="${process.env.BASE_URL}/verify-email?token=testtoken" style="margin: 0 auto; display: inline-block; background-color: #0366d6; color: white; text-decoration: none; padding: 15px 25px; margin: 20px 0; cursor: pointer; border-radius: 5px; font-size: 18px;">Verify Email</a>
                <p style="color: #586069; font-size: 18px;">If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e1e4e8; margin: 20px 0;">
                <p style="color: #586069; font-size: 12px; font-style: italic;">This is an automated message, please do not reply.</p>
                <div style="margin-top: 30px; padding: 15px; background-color: #f6f8fa; border-radius: 5px; border: 1px solid #e1e4e8;">
                    <h2 style="color: #24292e; font-size: 20px; font-weight: bold; margin-bottom: 15px;">Need Help?</h2>
                    <p style="color: #586069; font-size: 16px;">If you're having trouble clicking the "Verify Email" button, copy and paste the URL below into your web browser:</p>
                    <p style="color: #0366d6; font-size: 16px;">${process.env.BASE_URL}/verify-email?token=testtoken</p>
                </div>
            </div>
        </div>
    `
};

    await transporter.sendMail(mailOptions);
}

// Call the function to send a test email
sendTestEmail().catch(console.error);