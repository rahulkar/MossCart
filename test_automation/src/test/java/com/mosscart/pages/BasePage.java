package com.mosscart.pages;

import com.mosscart.support.DriverManager;
import com.mosscart.support.TestConfig;
import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public abstract class BasePage {

  protected final WebDriver driver;
  protected final WebDriverWait wait;
  protected final WebDriverWait shortWait;

  protected BasePage() {
    this.driver = DriverManager.getDriver();
    Duration timeout = TestConfig.defaultWaitTimeout();
    Duration poll = TestConfig.waitPollInterval();
    this.wait = new WebDriverWait(driver, timeout);
    this.wait.pollingEvery(poll);
    this.shortWait = new WebDriverWait(driver, TestConfig.shortWaitTimeout());
    this.shortWait.pollingEvery(poll);
  }

  protected void openPath(String path) {
    String base = TestConfig.baseUrl();
    String p = path.startsWith("/") ? path : "/" + path;
    driver.get(base + p);
  }

  protected WebElement waitVisible(By locator) {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
  }

  protected WebElement waitClickable(By locator) {
    return wait.until(ExpectedConditions.elementToBeClickable(locator));
  }

  protected boolean waitInvisible(By locator) {
    return shortWait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
  }

  protected void waitStaleness(WebElement element) {
    wait.until(ExpectedConditions.stalenessOf(element));
  }

  /** Visible element inside an already-located context. */
  protected WebElement waitVisible(WebElement root, By locator) {
    return wait.until(
        d -> {
          try {
            WebElement el = root.findElement(locator);
            return el.isDisplayed() ? el : null;
          } catch (StaleElementReferenceException e) {
            return null;
          }
        });
  }
}
