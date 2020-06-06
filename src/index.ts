import puppeteer, { Browser, errors, BrowserEventObj } from 'puppeteer'
import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import cors from 'cors'
import { sendAttachment, sendError, emptyDirectory, deleteStaleDownloadFile } from './emailClient'

const app = express()
const port = process.env.PORT || 3000
app.use(express.static(path.join(__dirname, '../dist')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

let browser: Browser, page: puppeteer.Page, tickClock: NodeJS.Timeout;

async function beforeAll() {
  emptyDirectory('./snapshots')
  deleteStaleDownloadFile()
  browser = await puppeteer.launch({ args: ['--incognito'] });
  const context = await browser.createIncognitoBrowserContext();
  page = await context.newPage();
  await page.setViewport({ width: 3000, height: 1000 });
  scheduleSnapshots()
}

// take snapshots at regular intervals
function scheduleSnapshots(interval = 2000) {
  let snapshotIndex = 0;
  tickClock = setInterval(function () {

    const path = `snapshots/snapshot${++snapshotIndex}-${interval / 1000 * snapshotIndex}s.png`
    console.log(path)

    page.screenshot({ path })
  }, interval);
}

async function doWork(link: string) {
  await page.goto('https://ebook.online-convert.com/convert-to-mobi')

  const clickOnElement = (query: string) => page.$eval(query, (e) => (e as unknown as puppeteer.ElementHandle<Element>).click())
  await clickOnElement('a#externalUrlButton')
  await clickOnElement('input#externalUrlInput')
  await page.focus('input#externalUrlInput')
  await page.keyboard.type(link)
  await clickOnElement('button#externalUrlDialogOkButton')
  // await sleep(1000)

  // here we are at the part where we add the URL to our file
  await page.waitForSelector('div.deletebutton', { timeout: 2000000 })
  await clickOnElement('button#multifile-submit-button-main')

  // wait for our download page to show up
  await page.waitForSelector('div#fallback-link', { timeout: 20000 })
  const client = await page.target().createCDPSession();

  await page.waitForSelector('button.zip-download.zip-download-single.zip-download-grey', { timeout: 1000000 })
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: './download' })
  await page.waitFor(50000)

  console.log('success!')

}

async function wasBrowserKilled() {
  const procInfo = await browser.process();
  return !!procInfo.signalCode;
}

async function afterAll() {
  clearInterval(tickClock)
  await page.screenshot({ path: 'end.png' });
  await browser.close()
  console.log(`Closed session safely: browser killed status: ${await wasBrowserKilled()}`)
}

// thread that runs everything
async function run({ email, url }: { email: string, url: string }) {
  await beforeAll()
  let hitError = false

  try {
    await doWork(url)
  } catch (error) {
    hitError = true;
    console.error(error)
  } finally {
    await afterAll()

    if (hitError) {
      console.log('hit an error')
      sendError(email)
    } else {
      console.log('sending email to ' + email)
      sendAttachment(email)
    }
  }
}


// finally some express
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'dist', 'index.html'))
})

app.post('/', (req, res) => {
  console.log(req.body)

  const [email, url] = [req.body.email, req.body.url]

  if (email == undefined || url == undefined) {
    res.sendStatus(400)
    return;
  }

  run({ email, url })
  res.sendStatus(200)
})

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
