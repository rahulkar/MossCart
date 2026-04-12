package com.mosscart.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class RegisterPage extends BasePage {

  private static final By NAME = By.cssSelector("[data-testid='register-name']");
  private static final By EMAIL = By.cssSelector("[data-testid='register-email']");
  private static final By PASSWORD = By.cssSelector("[data-testid='register-password']");
  private static final By SUBMIT = By.cssSelector("[data-testid='register-submit']");
  private static final By NAV_PROFILE = By.cssSelector("[data-testid='nav-profile']");

  public void open() {
    openPath("/register");
  }

  public void register(String name, String email, String password) {
    fillAndSubmit(name, email, password);
    waitVisible(NAV_PROFILE);
  }

  public void fillAndSubmit(String name, String email, String password) {
    WebElement n = waitVisible(NAME);
    n.clear();
    n.sendKeys(name);
    WebElement em = waitVisible(EMAIL);
    em.clear();
    em.sendKeys(email);
    WebElement pw = waitVisible(PASSWORD);
    pw.clear();
    pw.sendKeys(password);
    waitVisible(SUBMIT).click();
  }

  public void assertRegistrationErrorVisible() {
    waitVisible(By.cssSelector("[data-testid='register-error']"));
  }

  public void assertRegisterFormVisible() {
    waitVisible(By.cssSelector("[data-testid='register-title']"));
  }
}
