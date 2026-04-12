package com.mosscart.support;

import org.openqa.selenium.WebDriver;

public final class DriverManager {

  private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();

  private DriverManager() {}

  public static WebDriver peekDriver() {
    return DRIVER.get();
  }

  public static WebDriver getDriver() {
    WebDriver d = DRIVER.get();
    if (d == null) {
      throw new IllegalStateException("WebDriver not initialized for this thread");
    }
    return d;
  }

  public static void setDriver(WebDriver driver) {
    DRIVER.set(driver);
  }

  public static void quitDriver() {
    WebDriver d = DRIVER.get();
    if (d != null) {
      try {
        d.quit();
      } finally {
        DRIVER.remove();
      }
    }
  }
}
