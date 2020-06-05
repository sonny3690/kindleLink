import mailer from 'nodemailer'
import fs from 'fs'

const email = 'kindle.email.service@gmail.com'
const recipient = 'sonny3690@gmail.com'


const transporter = mailer.createTransport({
  service: 'gmail',

  auth: {
    user: email,
    pass: process.env.EMAIL_PW
  }
})

const mailOptions = {
  from: email,
  to: recipient,
  subject: 'Your Kindle Book!',
}


transporter.sendMailer(mailOptions, function (error: any, info: any) {
  if (error) {
    console.error('Error in sending message: ' + error)
  } else {
    console.log('Email sent! ' + info)
  }
})

fs.readdirSync('./download').forEach(

  file => {
    console.log(file)
  }

)


