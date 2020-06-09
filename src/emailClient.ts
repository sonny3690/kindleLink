import mailer from 'nodemailer'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as path from 'path'

const sender = 'kindle.email.service@gmail.com'
const downloadDir = './download'

dotenv.config()

const send = (email: string, attachments: { filename: string, path: string }[]) => {

  const transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
      user: sender,
      pass: process.env.EMAIL_PW
    }
  })

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

  const transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
      user: sender,
      pass: process.env.EMAIL_PW
    }
  })
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
    file => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime })).sort((a, b) => b.mtime.getTime() - a.mtime.getTime()).map(f => f.file)


  if (files.length === 0 && !latest) {
    throw Error('We couldnt download the file')
  }
  // keep in case of future support of multiple files
  // return [[files[latest ? files.length - 1 : 0], files.length]
  return files || []
};

export const deleteStaleDownloadFile = () => {
  const files = getMostRecentFile(downloadDir, true);

  if (files.length === 0) {
    return
  }

  try {
    fs.unlinkSync(path.join(downloadDir, files[files.length - 1]))
  } catch (e) {
    console.error(e)
  }
}

export const matchingFile = (dir: string, fileName: string) => {
  const file = fs.readdirSync(dir).filter(f => f === fileName)

  if (file.length === 0) {
    console.error('No matching file!!!')
    return []
  }

  return [file[0]]
}


export const sendAttachment = (email: string, fileName: string) => {
  const recentFiles = matchingFile(downloadDir, fileName)
  console.log('Sending ' + JSON.stringify(recentFiles[0]))

  if (recentFiles.length === 0) {
    sendError(email)
    return
  }
  // map for future multiattachment support
  const attachments = [recentFiles[0]].map(
    book => ({ filename: book, path: `${downloadDir}/${book}` })
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

