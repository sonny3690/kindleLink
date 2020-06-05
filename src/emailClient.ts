import mailer from 'nodemailer'
import fs from 'fs'
import dotenv from 'dotenv'
const email = 'kindle.email.service@gmail.com'
const recipient = 'sonny3690@gmail.com'
const downloadDir = './download'
const books = fs.readdirSync('./download')

dotenv.config()

const transporter = mailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: process.env.EMAIL_PW
  }
})

const attachments = books.map(
  book => ({ filename: book, path: `${downloadDir}/${book}` })
)

const mailOptions = {
  from: email,
  to: recipient,
  subject: 'Your Kindle Book!',
  attachments
}

transporter.sendMail(mailOptions, function (error: any, info: any) {
  if (error) {
    console.error('Error in sending message: ' + error)
  } else {
    console.log('Email sent! ' + JSON.stringify(info, null, '\t'))
  }
})



