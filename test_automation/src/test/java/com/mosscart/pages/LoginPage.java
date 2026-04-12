package com.mosscart.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class LoginPage extends BasePage {

  private static final By EMAIL = By.cssSelector("[data-testid='login-email']");
  private static final By PASSWORD = By.cssSelector("[data-testid='login-password']");
  private static final By SUBMIT = By.cssSelector("[data-testid='login-submit']");

  public void open() {
    openPath("/login");
  }

  public void login(String email, String password) {
    WebElement e = waitVisible(EMAIL);
    e.clear();
    e.sendKeys(email);
    WebElement p = waitVisible(PASSWORD);
    p.clear();
    p.sendKeys(password);
    waitVisible(SUBMIT).click();
  }

  public void assertLoginErrorVisible() {
    waitVisible(By.cssSelector("[data-testid='login-error']"));
  }

  public void assertOnLoginPage() {
    waitVisible(By.cssSelector("[data-testid='page-login']"));
  }
}
