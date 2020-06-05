import mailer from 'nodemailer'
import fs from 'fs'
import dotenv from 'dotenv'
const sender = 'kindle.email.service@gmail.com'
const downloadDir = './download'

dotenv.config()

const transporter = mailer.createTransport({
  service: 'gmail',
  auth: {
    user: sender,
    pass: process.env.EMAIL_PW
  }
})


const send = (email: string, attachments: { filename: string, path: string }[]) => {

  const mailOptions = {
    from: sender,
    to: email,
    subject: 'Your Kindle Book!',
    attachments
  }

  transporter.sendMail(Object.assign(mailOptions, function (error: any, info: any) {
    if (error) {
      console.error('Error in sending message: ' + error)
    } else {
      console.log('Email sent! ' + JSON.stringify(info, null, '\t'))
    }
  }))
}

export const sendError = (email: string) => {

  const mailOptions = {
    from: sender,
    to: email,
    subject: 'Error in Processing: RIPPP',
    text: 'Sorry, but there was an error in processing our send.'
  }

  transporter.sendMail(Object.assign(mailOptions, function (error: any, info: any) {
    if (error) {
      console.error('Error in sending error email: ' + error)
    } else {
      console.log('Email sent! ' + JSON.stringify(info, null, '\t'))
    }
  }))
}


const orderReccentFiles = (dir: string) =>
  fs.readdirSync(dir)
    .filter(f => fs.lstatSync(f).isFile())
    .map(file => ({ file, mtime: fs.lstatSync(file).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

const getMostRecentFile = (dir: string) => {
  const files = orderReccentFiles(dir);

  if (files.length === 0) {
    throw Error('We couldnt download the file')
  }

  // keep in case of future support of multiple files
  return [files[0]]
};


export const sendAttachment = (email: string) => {
  const recentFile = getMostRecentFile(downloadDir)

  // map for future multiattachment support
  const attachments = recentFile.map(
    book => ({ filename: book.file, path: `${downloadDir}/${book.file}` })
  )

  send(email, attachments)

}
