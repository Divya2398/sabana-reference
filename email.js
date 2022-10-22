const nodemailer = require("nodemailer");
const ejs = require("ejs");
const { join } = require("path");
const sgMail = require("@sendgrid/mail");
const API_KEY =
  "***********************************";
sgMail.setApiKey(API_KEY);

// const transporter = nodemailer.createTransport({
//   port: 465,
//   host: "smtp.gmail.com",
//   auth: {
//     user: "dazzlingshinne@gmail.com",
//     pass: "shineedazzling",
//   },
// });
// const transporter = nodemailer.createTransport({
//   port: 465,
//   host: "smtp.sendgrid.net",
//   auth: {
//     user: "apikey",
//     pass: "give sendgrid apikey here",
//   },
// });

async function mail_to_customer(mailData) {
  try {
    const data = await ejs.renderFile(
      join(__dirname, "../templates/", mailData.fileName),
      mailData,
      mailData.details
    );
    const maildetail = {
      from: mailData.from,
      to: mailData.to,
      subject: mailData.subject,
      // fileName: mailData.fileName,
      html: data,
    };
    sgMail.send(maildetail, (err) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("mail sent");
      }
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json(error.message);
  }
}

const sendEmail = async (email, subject, text) => {
  try {
    await sgMail.send({
      from: "divya.platosys@gmail.com",
      to: email,
      subject: subject,
      text: text,
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log(error, "email not sent");
  }
};

module.exports = { mail_to_customer: mail_to_customer, sendEmail: sendEmail };
