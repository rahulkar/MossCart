package com.mosscart.pages;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class ProfilePage extends BasePage {

  private static final By TITLE = By.cssSelector("[data-testid='profile-title']");
  private static final By EDIT_BTN = By.cssSelector("[data-testid='profile-edit-btn']");
  private static final By SAVE_BTN = By.cssSelector("[data-testid='profile-save-btn']");
  private static final By CANCEL_BTN = By.cssSelector("[data-testid='profile-cancel-btn']");
  private static final By NAME_INPUT = By.cssSelector("[data-testid='profile-name-input']");
  private static final By EMAIL_INPUT = By.cssSelector("[data-testid='profile-email-input']");
  private static final By EMAIL_DISPLAY = By.cssSelector("[data-testid='profile-email-display']");
  private static final By LOGOUT_PROFILE = By.cssSelector("[data-testid='profile-logout-btn']");

  public void open() {
    openPath("/profile");
  }

  public void assertLoaded() {
    waitVisible(TITLE);
  }

  public void assertHasOrderRow() {
    wait.until(
        ExpectedConditions.presenceOfElementLocated(
            By.cssSelector("[data-testid^='profile-order-']")));
  }

  public void startEditProfile() {
    waitVisible(EDIT_BTN).click();
    waitVisible(NAME_INPUT);
  }

  public void cancelEditProfile() {
    waitVisible(CANCEL_BTN).click();
    waitVisible(EDIT_BTN);
  }

  public void saveProfileWithName(String newName) {
    WebElement el = waitVisible(NAME_INPUT);
    ((org.openqa.selenium.JavascriptExecutor) driver)
        .executeScript(
            "const el = arguments[0]; const val = arguments[1];"
                + "const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');"
                + "desc.set.call(el, val);"
                + "el.dispatchEvent(new Event('input', { bubbles: true }));"
                + "el.dispatchEvent(new Event('change', { bubbles: true }));",
            el,
            newName);
    waitVisible(SAVE_BTN).click();
    waitVisible(EDIT_BTN);
  }

  public String getEmailDisplayText() {
    return waitVisible(EMAIL_DISPLAY).getText();
  }

  public void assertEmailInputVisible() {
    waitVisible(EMAIL_INPUT);
  }

  public void enterEmail(String email) {
    WebElement el = waitVisible(EMAIL_INPUT);
    ((org.openqa.selenium.JavascriptExecutor) driver)
        .executeScript(
            "const el = arguments[0]; const val = arguments[1];"
                + "const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');"
                + "desc.set.call(el, val);"
                + "el.dispatchEvent(new Event('input', { bubbles: true }));"
                + "el.dispatchEvent(new Event('change', { bubbles: true }));",
            el,
            email);
  }

  public void assertEmailInputInvalid() {
    WebElement el = waitVisible(EMAIL_INPUT);
    Object valid =
        ((org.openqa.selenium.JavascriptExecutor) driver)
            .executeScript("return arguments[0].validity.valid;", el);
    if (Boolean.TRUE.equals(valid)) {
      throw new AssertionError("Email input should be invalid");
    }
  }

  public void saveProfileChanges() {
    waitVisible(SAVE_BTN).click();
    waitVisible(EDIT_BTN);
  }

  public void openFirstOrderReceipt() {
    wait.until(
        ExpectedConditions.presenceOfElementLocated(
            By.cssSelector("[data-testid^='profile-order-link-']")));
    driver.findElements(By.cssSelector("a[data-testid^='profile-order-link-']")).get(0).click();
  }

  public void assertLatestOrderPaymentStatusContains(String fragment) {
    waitVisible(By.cssSelector("[data-testid='profile-orders']"));
    List<WebElement> statuses =
        driver.findElements(By.cssSelector("[data-testid^='profile-order-status-']"));
    assertThat(statuses).isNotEmpty();
    assertThat(statuses.get(0).getText().toLowerCase()).contains(fragment.toLowerCase());
  }

  public void logoutFromProfile() {
    waitVisible(LOGOUT_PROFILE).click();
  }
}
