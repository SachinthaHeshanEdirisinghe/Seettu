const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

async function runMernTest() {
    
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        
        await driver.get('http://localhost:3000');
        
        
        let title = await driver.getTitle();
        console.log(`Page Title: ${title}`);

       
        let emailInput = await driver.wait(until.elementLocated(By.id('auth-email')), 5000);
        await emailInput.sendKeys('sachinthaheshanedirisinghe@gmail.com');

        
        let passwordInput = await driver.findElement(By.id('auth-password'));
        await passwordInput.sendKeys('Heshan@123');

        
        let submitBtn = await driver.findElement(By.id('submit'));
        await submitBtn.click();
        let successMessage = await driver.wait(
    until.elementLocated(By.css('.hero')), 
    10000
);

console.log("Test Passed: Success message appeared!");

    } catch (error) {
        console.error("Test Failed: ", error);
    } finally {
        await driver.quit();
    }
}

runMernTest();