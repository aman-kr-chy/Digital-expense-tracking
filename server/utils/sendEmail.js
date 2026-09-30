import nodemailer from 'nodemailer';

const escapeHtml = (value = '') => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

export const sendInviteEmail = async (toEmail, inviteLink, senderName, groupName = null) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP email settings are missing');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const safeSenderName = escapeHtml(senderName);
  const safeGroupName = groupName ? escapeHtml(groupName) : null;
  const info = await transporter.sendMail({
      from: {
        name: 'SplitEase',
        address: process.env.SMTP_USER,
      },
      to: toEmail,
      subject: safeGroupName
        ? `${senderName} invited you to join ${groupName} on SplitEase!`
        : `${senderName} invited you to join SplitEase!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #10b981; margin-top: 0;">SplitEase</h2>
          <p>Hi there,</p>
          <p><strong>${safeSenderName}</strong> has invited you to join SplitEase${safeGroupName ? ` and join the group <strong>${safeGroupName}</strong>` : ''}!</p>
          <p>After you create your account, you will be added as ${safeSenderName}'s friend${safeGroupName ? ` and become a member of <strong>${safeGroupName}</strong>` : ''}.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ${safeGroupName ? 'Create Account & Join Group' : 'Create Account & Join'}
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="color: #6b7280; font-size: 14px; word-break: break-all;">${inviteLink}</p>
        </div>
      `,
    });

  return { success: true, messageId: info.messageId };
};
