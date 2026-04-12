package com.mosscart.support;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public final class BrowserSession {

  /** Must match {@code TOKEN_KEY} in the MossCart SPA. */
  public static final String TOKEN_STORAGE_KEY = "mosscart_token";

  private BrowserSession() {}

  /** Loads the app origin, stores the JWT, and refreshes so the SPA picks up the session. */
  public static void injectAuthTokenAndRefreshHome(String token) {
    WebDriver driver = DriverManager.getDriver();
    String base = TestConfig.baseUrl();
    driver.get(base.endsWith("/") ? base : base + "/");
    JavascriptExecutor js = (JavascriptExecutor) driver;
    js.executeScript(
        "window.localStorage.setItem(arguments[0], arguments[1]);",
        TOKEN_STORAGE_KEY,
        token);
    driver.navigate().refresh();
  }
}
