import puppeteer from 'puppeteer'
import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import cors from 'cors'
import { params } from './models'
import { sendAttachment, sendError, emptyDirectory, deleteStaleDownloadFile } from './emailClient'

const app = express()
const port = process.env.PORT || 3000
app.use(express.static(path.join(__dirname, '../dist')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

async function beforeAll(params) {
  emptyDirectory('./snapshots')
  deleteStaleDownloadFile()
  params.browser = await puppeteer.launch({ args: ['--incognito', '--no-sandbox'] });
  const context = await params.browser.createIncognitoBrowserContext();
  params.page = await context.newPage();
  await params.page.setViewport({ width: 3000, height: 1000 });
  scheduleSnapshots(params)
}

// take snapshots at regular intervals
function scheduleSnapshots(params, interval = 5000) {
  let snapshotIndex = 0;
  params.tickClock = setInterval(function () {

    const path = `snapshots/snapshot${++snapshotIndex}-${interval / 1000 * snapshotIndex}s.png`
    console.log(path)

    params.page.screenshot({ path })
  }, interval);
}

async function doWork(params: params) {
  await params.page.goto('https://ebook.online-convert.com/convert-to-mobi')

  const clickOnElement = (query: string) => params.page.$eval(query, (e) => (e as unknown as puppeteer.ElementHandle<Element>).click())
  await clickOnElement('a#externalUrlButton')
  await clickOnElement('input#externalUrlInput')
  await params.page.focus('input#externalUrlInput')
  await params.page.keyboard.type(params.url)
  await clickOnElement('button#externalUrlDialogOkButton')
  // await sleep(1000)

  // here we are at the part where we add the URL to our file
  await params.page.waitForSelector('div.deletebutton', { timeout: 2000000 })
  await clickOnElement('button#multifile-submit-button-main')

  // wait for our download page to show up
  await params.page.waitForSelector('div#fallback-link', { timeout: 20000 })
  const client = await params.page.target().createCDPSession();

  await params.page.waitForSelector('button.zip-download.zip-download-single.zip-download-grey', { timeout: 1000000 })

  const fileElement = await params.page.$("span.download-span > a");
  const fileName = await (await fileElement.getProperty('textContent')).jsonValue();

  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: './download' })
  await params.page.waitFor(50000)

  console.log('success!')

  return fileName
}

async function wasBrowserKilled(params: params) {
  const procInfo = await params.browser.process();
  return !!procInfo.signalCode;
}

async function afterAll(params) {
  await clearInterval(params.tickClock)
  await params.browser.close()
  console.log(`Closed session safely: params.browser killed status: ${await wasBrowserKilled(params)}`)
}

// thread that runs everything
async function run(params: params) {
  await beforeAll(params)
  let fileName = undefined

  console.log(params)
  let hitError = false

  try {
    fileName = await doWork(params)
  } catch (error) {
    hitError = true;
    console.error(error)
  } finally {
    await afterAll(params)

    if (hitError || fileName == undefined) {
      console.log('hit an error')
      sendError(params.email)
    } else {
      console.log('sending email to ' + params.email)
      sendAttachment(params.email, fileName)
    }
  }
}


// finally some express
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'dist', 'index.html'))
})

app.post('/', (req, res) => {
  console.log(req.body)

  const [email, url] = [req.body.email, req.body.url] as string[]

  if (email == 'undefined' || url == 'undefined') {
    res.sendStatus(400)
    return;
  }

  const params: params = {
    email,
    url,
    browser: undefined,
    page: undefined,
    tickClock: undefined
  }

  run(params)
  res.sendStatus(200)
})

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
