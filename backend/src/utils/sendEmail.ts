import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  let transporter;

  const isProduction = config.NODE_ENV === 'PRODUCTION';

  if (isProduction) {
    transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: Number(config.smtp_port) || 587,
      secure: true,
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const info = await transporter.sendMail({
    from: config.smtp_from || '"Uni Portal 360" <no-reply@uni-portal-360.com>',
    to,
    subject: 'Reset your Uni Portal 360 password',
    text: '',
    html,
  });

  if (!isProduction) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      // eslint-disable-next-line no-console
      console.log('Ethereal email preview:', previewUrl);
    }
  }
};
