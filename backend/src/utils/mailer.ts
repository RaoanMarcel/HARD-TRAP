import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // se usar 465, troque para true
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  
});

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: '"Suporte HardTrap" <no-reply@hardtrap.com>',
    to,
    subject: "Redefinição de senha - HardTrap",
    html: `
      <h3>Olá!</h3>
      <p>Você solicitou a redefinição de senha. Clique no link abaixo para redefinir:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p><strong>O link expira em 15 minutos.</strong></p>
    `,
  });
};
