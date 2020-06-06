import mailer from 'nodemailer'
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'

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
  })).then(r => console.log('Done sending')).catch(e => {

    console.error(e)
    sendError(email)

  })
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



const getMostRecentFile = (dir: string, latest = false) => {
  const files = fs.readdirSync(dir).filter(f => fs.lstatSync(path.join(dir, f)).isFile()).map(
    file => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime })).sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  if (files.length === 0 && !latest) {
    throw Error('We couldnt download the file')
  }
  // keep in case of future support of multiple files
  return [files[latest ? files.length - 1 : 0]]
};

export const deleteStaleDownloadFile = () => {
  const recent = getMostRecentFile(downloadDir, true);

  try {
    fs.unlinkSync(path.join(downloadDir, recent[0].file))
  } catch (e) {
    console.error(e)
  }

}


export const sendAttachment = (email: string) => {
  const recentFile = getMostRecentFile(downloadDir)
  console.log('Sending ' + JSON.stringify(recentFile[0]))

  // map for future multiattachment support
  const attachments = recentFile.map(
    book => ({ filename: book.file, path: `${downloadDir}/${book.file}` })
  )

  send(email, attachments)

}

export const emptyDirectory = (dir: string) => {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(dir, file), err => {
        if (err) throw err;
      });
    }
  });
}

