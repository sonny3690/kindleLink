import puppeteer, { Browser } from 'puppeteer'

let browser: Browser
let page: puppeteer.Page
let link: string = 'http://80.82.78.13/get.php?md5=d1b01bd1c1f8aa9f998b0e4d2e98bcf7&key=FPK0BE241MQ8XKME&mirr=1'

async function beforeAll() {
  browser = await puppeteer.launch({ args: ['--incognito'] });
  const context = await browser.createIncognitoBrowserContext();
  page = await context.newPage();
  await page.setViewport({ width: 3000, height: 1000 });
}

async function doWork() {
  await page.goto('https://ebook.online-convert.com/convert-to-mobi')

  const clickOnElement = (query: string) => page.$eval(query, (e) => (e as unknown as puppeteer.ElementHandle<Element>).click())
  const sleep = (dur: number) => new Promise(r => setTimeout(r, dur))

  await clickOnElement('a#externalUrlButton')
  await clickOnElement('input#externalUrlInput')
  await page.keyboard.type(link)
  // await clickOnElement('footer#__BVID__17___BV_modal_footer_ > button.btn.btn-primary')
  await clickOnElement('button#externalUrlDialogOkButton')
  // await sleep(1000)
  await page.waitForSelector('div.deletebutton', { timeout: 100000 })
  await page.screenshot({ path: 'start.png' });
  // await (page as any)._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: './' });

  await browser.close();
}


async function afterAll() {

  await page.screenshot({ path: 'start.png' });
  await browser.close();
}


(async () => {
  await beforeAll()
  try {
    await doWork()
  } catch (error) {
    console.error(error)
  } finally {
    await afterAll()

  }
})()  