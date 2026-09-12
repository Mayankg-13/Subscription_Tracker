import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || 2525,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
};

export const sendRenewalEmail = async ({ to, subscriptionName, amount, renewalDate }) => {
  try {
    const transporter = createTransporter();

    const formattedDate = new Date(renewalDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);

    const message = {
      from: process.env.EMAIL_FROM || '"SubTrack" <no-reply@subtrack.app>',
      to,
      subject: `Upcoming Subscription Renewal: ${subscriptionName}`,
      text: `Hello,\n\nYour ${subscriptionName} subscription (${formattedAmount}) renews on ${formattedDate}.\n\nThank you for using SubTrack!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 16px;">SubTrack Renewal Reminder</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            Your <strong>${subscriptionName}</strong> subscription (<strong>${formattedAmount}</strong>) is scheduled to renew on <strong>${formattedDate}</strong>.
          </p>
          <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">
              Log in to your SubTrack account if you need to update or cancel this subscription.
            </p>
          </div>
          <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">
            SubTrack - Automated Subscription Tracker
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(message);
    console.log(`[Email Sent] To: ${to} | Sub: ${subscriptionName} | MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Failed] To: ${to} | Sub: ${subscriptionName} | Error: ${error.message}`);
    return false;
  }
};
