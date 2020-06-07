import { Browser, Page } from 'puppeteer'

export interface params {
  browser: Browser,
  tickClock: NodeJS.Timeout,
  page: Page,
  interval?: 5000,
  email: string,
  url: string
}