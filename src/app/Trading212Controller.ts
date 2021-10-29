import {Request, Response, Router} from 'express';


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
                        const current = queue.pop();
                        const [By, driver, until] = this.initSelenium();
                        try {
                            switch (current.order) {
                                case "BUY": {
                                    await this.buyAsset(current.asset, this.EMAIL, this.PASSWORD, driver, By, until);
                                    break;
                                }
                                case "SELL":
                                case "STOP": {
                                    await this.sellAsset(current.asset, this.EMAIL, this.PASSWORD, driver, By, until);
                                    break;
                                }
                            }
                        } catch (err) {
                            console.log("Internal error: ", err)
                            await driver.quit();
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

    private async buyAsset(asset, email, password, driver, By, until) {
        await this.login(email, password, driver, By, until);
        const searchInput = await this.getElement(By.css("#app > div.layout.invest.real.equity.active-tab-search.normal-mode > div.main > div.content > div > div.search-body > div.search-input-wrapper.search-input > input"), driver, until)
        searchInput.sendKeys(asset)
        await this.click(By.css("#app > div.layout.invest.real.equity.active-tab-search.normal-mode > div.main > div.content > div > div.search-body > div.search-results > div.search-results-content > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div"), driver, until)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.active-popup-instrument-advanced-popup.slide-up > div > div.popup-content > div > div > div.scrollable-area > div > div.invest-instrument-advanced-header > div:nth-child(2) > div.trading-buttons > span"), driver, until)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.invest-by-dropdown-container > div > div > div:nth-child(2)"), driver, until)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.dropdown-animation-enter-done > div > div > div > div:nth-child(1)"), driver, until)
        const valorElement = await this.getElement(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.order-dialog-input > div.formatted-number-input.center > div.input-wrapper > input"), driver, until)
        await valorElement.sendKeys(this.AMOUNT_PER_TRANSACTION)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.button.accent-button"), driver, until)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-review-order-popup.scale > div.popup-container.review-order-popup.popup-animation-enter-done > div.popup-content > div > div.body > div.button.accent-button"), driver, until)
    }

    private async sellAsset(asset, email, password, driver, By, until) {
        await this.login(email, password, driver, By, until);

        const searchInput = await this.getElement(By.css("#app > div.layout.invest.real.equity.active-tab-search.normal-mode > div.main > div.content > div > div.search-body > div.search-input-wrapper.search-input > input"), driver, until)
        searchInput.sendKeys(asset)
        await this.click(By.css("#app > div.layout.invest.real.equity.active-tab-search.normal-mode > div.main > div.content > div > div.search-body > div.search-results > div.search-results-content > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div"), driver, until)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.active-popup-instrument-advanced-popup.slide-up > div > div.popup-content > div > div > div.scrollable-area > div > div.invest-instrument-advanced-header > div:nth-child(2) > div.trading-buttons > span"), driver, until)
        await this.sleep(1000)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.horizontal-slider-wrapper > div:nth-child(1)"), driver, until)
        await this.sleep(1000)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.horizontal-slider-wrapper > div:nth-child(3)"), driver, until)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.horizontal-slider-wrapper > div:nth-child(3)"), driver, until)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.horizontal-slider-wrapper > div:nth-child(3)"), driver, until)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.horizontal-slider-wrapper > div:nth-child(3)"), driver, until)
        await this.sleep(1000)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.horizontal-slider-wrapper > div:nth-child(3)"), driver, until)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.horizontal-slider-wrapper > div:nth-child(3)"), driver, until)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.horizontal-slider-wrapper > div:nth-child(3)"), driver, until)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.scrollable-area-wrapper.bottom.with-height-transition > div > div > div.horizontal-slider-wrapper > div:nth-child(3)"), driver, until)
        await this.sleep(1000)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-new-order-popup.scale > div.popup-container.new-order-popup.popup-animation-enter-done > div.popup-content > div > div.button.accent-button"), driver, until)
        await this.click(By.css("#app > div.popup-wrapper.popup-opened.delay.active-popup-review-order-popup.scale > div.popup-container.review-order-popup.popup-animation-enter-done > div.popup-content > div > div.body > div.button.accent-button"), driver, until)
    }

    private initSelenium() {
        const webdriver = require('selenium-webdriver');
        const By = webdriver.By;
        const until = webdriver.until;
        require('chromedriver');
        const chrome = require('selenium-webdriver/chrome');

        const local = false;
        if (local) {
            const chromedriver = require('chromedriver');
            chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
            const driver = new webdriver.Builder()
                .withCapabilities(webdriver.Capabilities.chrome())
                .build();
            return [By, driver, until]
        }

        let options = new chrome.Options();
        options.setChromeBinaryPath(process.env.CHROME_BINARY_PATH);
        let serviceBuilder = new chrome.ServiceBuilder(process.env.CHROME_DRIVER_PATH);

        //Don't forget to add these for heroku
        options.addArguments("--headless");
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");

        let driver = new webdriver.Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .setChromeService(serviceBuilder)
            .build();

        return [By, driver, until]
    }

    private async login(email, password, driver, By, until) {
        driver.get('https://live.trading212.com');
        try {
            const emailElement = await this.getElement(By.name("email"), driver, until)
            await emailElement.sendKeys(email)
            const passwordElement = await this.getElement(By.name("password"), driver, until)
            await passwordElement.sendKeys(password)
            const loginButton = await this.getElement(By.className("submit-button_input__3s_QD"), driver, until)
            await loginButton.click()
        } catch (err) {
            // already logged
        }
    }

    private async getElement(selector, driver, until) {
        return await driver.wait(until.elementLocated(selector), 10000);
    }

    private async click(selector, driver, until) {
        await driver.wait(until.elementLocated(selector), 10000).click();
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
