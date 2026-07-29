import nodemailer from 'nodemailer';
import pool from '../config/db.js';

export async function sendEmail({ tenantId, to, subject, templateType, templateVariables = {}, attachment = null }) {
  try {
    // 1. Fetch SMTP settings
    const [settings] = await pool.query('SELECT * FROM tenant_settings WHERE tenant_id = ?', [tenantId]);
    if (settings.length === 0) {
      console.warn(`No SMTP settings found for tenant: ${tenantId}`);
      return false;
    }
    const smtp = settings[0];

    // 2. Fetch Message Template (Module: 'Pagos')
    let messageText = '';
    const [templates] = await pool.query(
      'SELECT message_text, logo_base64 FROM message_templates WHERE tenant_id = ? AND module = ? AND message_type = ?',
      [tenantId, 'Pagos', templateType]
    );

    if (templates.length > 0) {
      messageText = templates[0].message_text;
      // Replace variables
      for (const [key, value] of Object.entries(templateVariables)) {
        messageText = messageText.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    } else {
      console.warn(`No template found for module 'Pagos' and type '${templateType}'`);
      // Fallback message
      messageText = `Estimado cliente, \n\nAdjuntamos la información solicitada. \n\nSaludos.`;
    }

    // 3. Setup Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: smtp.smtp_host,
      port: smtp.smtp_port,
      secure: smtp.smtp_secure === 1, // true for 465, false for other ports
      auth: {
        user: smtp.smtp_user,
        pass: smtp.smtp_pass
      }
    });

    // 4. Send Email
    const mailOptions = {
      from: smtp.smtp_user,
      to,
      subject,
      text: messageText,
    };

    if (attachment) {
      mailOptions.attachments = [
        {
          filename: attachment.filename,
          content: attachment.content,
          contentType: 'application/pdf'
        }
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
