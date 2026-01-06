import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

async function nodeMailer(user) {
  if (user) {
    const info = await transporter.sendMail({
      from: "Kaio Foo Koch 👻 <trongleele@gmail.com>",
      to: user.email,
      subject: "Hello ✔",
      text: "Hello world?",
      html: "<b>Hello world?</b>",
    });
    console.log("Message sent: %s", info.messageId);
  }
}

nodeMailer().catch(console.error);

export default nodeMailer;
