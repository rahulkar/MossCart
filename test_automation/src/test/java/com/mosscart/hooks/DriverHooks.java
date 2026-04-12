package com.mosscart.hooks;

import com.mosscart.support.DriverManager;
import com.mosscart.support.ScenarioContext;
import com.mosscart.support.TestConfig;
import io.github.bonigarcia.wdm.WebDriverManager;
import io.qameta.allure.Allure;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import java.io.ByteArrayInputStream;
import java.net.URL;
import java.time.Duration;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DriverHooks {

  private static final Logger log = LoggerFactory.getLogger(DriverHooks.class);

  @Before(order = 0)
  public void startBrowser(Scenario scenario) {
    String remote = TestConfig.seleniumRemoteUrl();
    WebDriver driver;
    try {
      if (remote != null && !remote.isBlank()) {
        driver = startRemoteDriver(remote.trim());
      } else {
        driver = startLocalDriver();
      }
    } catch (Exception e) {
      throw new RuntimeException("Failed to start WebDriver", e);
    }
    driver.manage().timeouts().implicitlyWait(Duration.ZERO);
    driver.manage().timeouts().pageLoadTimeout(TestConfig.pageLoadTimeout());
    driver.manage().timeouts().scriptTimeout(TestConfig.scriptTimeout());
    int[] win = TestConfig.windowSizeOrNull();
    if (win != null) {
      driver.manage().window().setSize(new org.openqa.selenium.Dimension(win[0], win[1]));
    } else {
      driver.manage().window().maximize();
    }
    DriverManager.setDriver(driver);
    // Do not call Allure.parameter here: AllureCucumber7Jvm registers the test case after early
    // @Before hooks, so parameters trigger "Could not update test case ... not found" ERROR spam.
  }

  private static WebDriver startRemoteDriver(String remoteUrl) throws Exception {
    String b = TestConfig.browser();
    if ("firefox".equals(b)) {
      FirefoxOptions o = new FirefoxOptions();
      if (TestConfig.headless()) {
        o.addArguments("-headless");
      }
      return new RemoteWebDriver(new URL(remoteUrl), o);
    }
    ChromeOptions o = new ChromeOptions();
    if (TestConfig.headless()) {
      o.addArguments("--headless=new", "--disable-gpu", "--window-size=1920,1080");
    }
    return new RemoteWebDriver(new URL(remoteUrl), o);
  }

  private static WebDriver startLocalDriver() {
    String b = TestConfig.browser();
    if ("firefox".equals(b)) {
      WebDriverManager.firefoxdriver().setup();
      FirefoxOptions o = new FirefoxOptions();
      if (TestConfig.headless()) {
        o.addArguments("-headless");
      }
      return new FirefoxDriver(o);
    }
    WebDriverManager.chromedriver().setup();
    ChromeOptions o = new ChromeOptions();
    if (TestConfig.headless()) {
      o.addArguments("--headless=new", "--disable-gpu", "--window-size=1920,1080");
    }
    return new ChromeDriver(o);
  }

  @After(order = 100)
  public void tearDown(Scenario scenario) {
    try {
      WebDriver d = DriverManager.peekDriver();
      if (scenario.isFailed() && d instanceof TakesScreenshot ts) {
        try {
          byte[] shot = ts.getScreenshotAs(OutputType.BYTES);
          scenario.attach(shot, "image/png", "failure");
          Allure.addAttachment("failure", "image/png", new ByteArrayInputStream(shot), "png");
        } catch (Exception e) {
          log.debug("Screenshot attach failed", e);
        }
      }
    } finally {
      DriverManager.quitDriver();
      ScenarioContext.clear();
    }
  }
}
