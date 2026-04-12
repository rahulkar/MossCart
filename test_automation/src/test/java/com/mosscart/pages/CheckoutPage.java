package com.mosscart.pages;

import com.mosscart.support.ScenarioContext;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class CheckoutPage extends BasePage {

  private static final By TITLE = By.cssSelector("[data-testid='checkout-title']");
  private static final By NAME = By.cssSelector("[data-testid='checkout-name']");
  private static final By LINE1 = By.cssSelector("[data-testid='checkout-line1']");
  private static final By CITY = By.cssSelector("[data-testid='checkout-city']");
  private static final By POSTAL = By.cssSelector("[data-testid='checkout-postal']");
  private static final By PAY = By.cssSelector("[data-testid='checkout-pay-btn']");
  private static final By EMPTY_CART = By.cssSelector("[data-testid='checkout-empty-cart']");
  private static final By ERROR = By.cssSelector("[data-testid='checkout-error']");
  private static final By PAYMENT_FAILED = By.cssSelector("[data-testid='checkout-payment-failed']");
  private static final By SIMULATE_DECLINE = By.cssSelector("[data-testid='checkout-simulate-decline']");
  private static final By SUMMARY_LINE = By.cssSelector("[data-testid^='checkout-summary-']");

  public void open() {
    openPath("/checkout");
  }

  public void assertLoaded() {
    waitVisible(TITLE);
  }

  public void assertGuestPrompt() {
    waitVisible(By.cssSelector("[data-testid='page-checkout-guest']"));
  }

  public void assertEmptyCartMessage() {
    waitVisible(EMPTY_CART);
  }

  public void assertSummaryLineCountAtLeast(int min) {
    wait.until(
        d -> {
          List<WebElement> els = d.findElements(SUMMARY_LINE);
          return els.size() >= min ? els : null;
        });
  }

  public void fillShippingAndPay() {
    fillShippingAndPay(ScenarioContext.simulatePaymentFailure());
  }

  public void fillShippingAndPay(boolean simulateDecline) {
    waitVisible(NAME).sendKeys("Test User");
    waitVisible(LINE1).sendKeys("123 Test Street");
    waitVisible(CITY).sendKeys("Testville");
    waitVisible(POSTAL).sendKeys("12345");
    if (simulateDecline) {
      waitClickable(SIMULATE_DECLINE).click();
    }
    waitClickable(PAY).click();
    if (simulateDecline) {
      waitVisible(PAYMENT_FAILED);
      wait.until(ExpectedConditions.urlContains("/checkout"));
    } else {
      wait.until(ExpectedConditions.urlContains("/profile"));
    }
  }

  public void submitEmptyRequiredFields() {
    waitVisible(TITLE);
    waitVisible(NAME).clear();
    waitVisible(LINE1).clear();
    waitVisible(CITY).clear();
    waitVisible(POSTAL).clear();
    waitVisible(PAY).click();
  }

  public void assertCheckoutErrorVisible() {
    waitVisible(ERROR);
  }

  public void assertPaymentDeclinedNoticeVisible() {
    waitVisible(PAYMENT_FAILED);
  }

  public void assertStillOnCheckoutUrl() {
    wait.until(ExpectedConditions.urlContains("/checkout"));
  }
}
