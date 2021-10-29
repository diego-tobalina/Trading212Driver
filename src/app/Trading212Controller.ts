import {Request, Response, Router} from 'express';


const chrome = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;

/*


const chromedriver = require('chromedriver');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
const driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();

 */


let options = new chrome.Options().windowSize({width: 1920, height: 1080});
options.setChromeBinaryPath(process.env.CHROME_BINARY_PATH);
let serviceBuilder = new chrome.ServiceBuilder(process.env.CHROME_DRIVER_PATH);

options.addArguments("--headless");
options.addArguments("--disable-gpu");
options.addArguments("--no-sandbox");

const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(serviceBuilder)
    .build();

let queue = []
let working = false;

class Trading212Controller {

    private router = Router();

    private EMAIL = process.env.EMAIL;
    private PASSWORD = process.env.PASSWORD;
    private AMOUNT_PER_TRANSACTION = process.env.AMOUNT_PER_TRANSACTION;


    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.post(`/trading212`, this.event)
    }

    event = async (req: Request, res: Response, next) => {
        try {

            const asset = req.body['asset'].toUpperCase();
            const order = req.body['order'].toUpperCase();
            const strategy = req.body['strategy'];

            const date = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Madrid'
            };
            const spainDate = date.toLocaleDateString('es-ES', options);

            console.log({
                time: spainDate,
                asset: asset,
                order: order,
                strategy
            })

            queue.push({
                asset,
                order,
            })
            console.log("Added to queue, actually there are: " + queue.length)
            res.json({status: 'ok'})
            next();

            new Promise(async () => {
                if (working) return;
                working = true;
                try {
                    while (queue.length > 0) {
                        console.log("Remaining in queue: ", queue.length)
                        const current = queue.shift();
                        try {
                            switch (current.order) {
                                case "BUY": {
                                    await this.buyAsset(current.asset, this.EMAIL, this.PASSWORD);
                                    break;
                                }
                                case "SELL":
                                case "STOP": {
                                    await this.sellAsset(current.asset, this.EMAIL, this.PASSWORD);
                                    break;
                                }
                            }
                        } catch (err) {
                            console.log("Internal error: ", err)
                        }
                    }
                    console.log("Remaining in queue: ", queue.length)
                } catch (err) {
                    console.log("catch error: ", err)
                }
                working = false;
            })
        } catch (e) {
            next(e);
        }
    }

    private async buyAsset(asset, email, password) {
        await this.login(email, password);
        await this.click(By.css("#app > div.layout.invest.real.equity.active-tab-search.normal-mode > div.main > div.content > div > div.search-body > div.search-input-wrapper.search-input > input"))
        const searchInput = await this.getElement(By.css("#app > div.layout.invest.real.equity.active-tab-search.normal-mode > div.main > div.content > div > div.search-body > div.search-input-wrapper.search-input > input"))
        await searchInput.sendKeys(asset)
        await this.sleep(5000)
        await this.click(By.css("#app > div.layout.invest.real.equity.active-tab-search.normal-mode > div.main > div.content > div > div.search-body > div.search-results > div.search-results-content > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div"))
        try {
            await this.click(By.css("#app > div.popup-wrapper.popup-opened.active-popup-instrument-advanced-popup.slide-up > div > div.popup-content > div > div > div.scrollable-area > div > div.invest-instrument-advanced-header > div:nth-child(2) > div.trading-buttons > span:nth-child(2)"))
        } catch (err) {
            await this.click(By.css("#app > div.popup-wrapper.popup-opened.active-popup-instrument-advanced-popup.slide-up > div > div.popup-content > div > div > div.scrollable-area > div > div.invest-instrument-advanced-header > div:nth-child(2) > div.trading-buttons > span"))
        }
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.invest-by-dropdown-container > div > div > div:nth-child(2)"))
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.dropdown-animation-enter-done > div > div > div > div:nth-child(1)"))
        const valorElement = await this.getElement(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.order-dialog-input > div.formatted-number-input.center > div.input-wrapper > input"))
        await valorElement.sendKeys(this.AMOUNT_PER_TRANSACTION)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.button.accent-button"))
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-review-order-popup.scale > div.popup-container.review-order-popup.popup-animation-enter-done > div.popup-content > div > div.body > div.button.accent-button"))
    }

    private async sellAsset(asset, email, password) {
        await this.login(email, password);

        const searchInput = await this.getElement(By.css("#app > div.layout.invest.real.equity.active-tab-search.normal-mode > div.main > div.content > div > div.search-body > div.search-input-wrapper.search-input > input"))
        await searchInput.sendKeys(asset)
        await this.sleep(5000)
        await this.click(By.css("#app > div.layout.invest.real.equity.active-tab-search.normal-mode > div.main > div.content > div > div.search-body > div.search-results > div.search-results-content > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div"))
        try {
            await this.getElement(By.css("#app > div.popup-wrapper.popup-opened.active-popup-instrument-advanced-popup.slide-up > div > div.popup-content > div > div > div.scrollable-area > div > div.invest-instrument-advanced-header > div:nth-child(2) > div.trading-buttons > span:nth-child(2)"))
        } catch (err) {
            console.log("No tienes de este asset");
            return;
        }
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.active-popup-instrument-advanced-popup.slide-up > div > div.popup-content > div > div > div.scrollable-area > div > div.invest-instrument-advanced-header > div:nth-child(2) > div.trading-buttons > span"))
        const slider = await this.getElement(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.horizontal-slider-wrapper > div.horizontal-slider > div.slider-bullet"))
        const rightArrow = await this.getElement(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.horizontal-slider-wrapper > div:nth-child(3)"))
        await driver.actions().dragAndDrop(slider, rightArrow).perform();
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.button.accent-button"))
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-review-order-popup.scale > div.popup-container.review-order-popup.popup-animation-enter-done > div.popup-content > div > div.body > div.button.accent-button"))
    }


    private async login(email, password) {
        driver.get('https://live.trading212.com');
        try {
            const emailElement = await this.getElement(By.name("email"))
            await emailElement.sendKeys(email)
            const passwordElement = await this.getElement(By.name("password"))
            await passwordElement.sendKeys(password)
            const loginButton = await this.getElement(By.className("submit-button_input__3s_QD"))
            await loginButton.click()
        } catch (err) {
            // already logged
        }
        await this.sleep(8000)
    }

    private async getElement(selector) {
        return await driver.wait(until.elementLocated(selector), 10000);
    }

    private async click(selector) {
        await driver.wait(until.elementLocated(selector), 10000).click();
        await this.sleep(2000)
    }

    private async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private static truncateDecimals(num, digits) {
        const numS = num.toString(),
            decPos = numS.indexOf('.'),
            substrLength = decPos == -1 ? numS.length : 1 + decPos + digits,
            trimmedResult = numS.substr(0, substrLength),
            finalResult = isNaN(trimmedResult) ? 0 : trimmedResult;
        return parseFloat(finalResult);
    }
}

export default Trading212Controller
