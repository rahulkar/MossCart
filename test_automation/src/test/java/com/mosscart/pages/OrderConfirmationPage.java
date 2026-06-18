package com.mosscart.pages;

import static org.assertj.core.api.Assertions.assertThat;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class OrderConfirmationPage extends BasePage {

  private static final By TITLE = By.cssSelector("[data-testid='order-confirmation-title']");
  private static final By SUBTITLE = By.cssSelector("[data-testid='order-confirmation-subtitle']");
  private static final By TOTAL = By.cssSelector("[data-testid='order-confirmation-total']");
  private static final By SHIPPING_NAME = By.cssSelector("[data-testid='order-confirmation-ship-name']");
  private static final By VIEW_PROFILE = By.cssSelector("[data-testid='order-confirmation-view-profile']");

  public void assertLoaded() {
    waitVisible(TITLE);
    waitVisible(SUBTITLE);
  }

  public void assertOnOrderConfirmationRoute() {
    wait.until(ExpectedConditions.urlContains("/order-confirmation/"));
  }

  public void assertTotalCents(int expectedCents) {
    String text = waitVisible(TOTAL).getText();
    assertThat(text).contains(String.format("$%.2f", expectedCents / 100.0));
  }

  public void assertShippingNameVisible() {
    waitVisible(SHIPPING_NAME);
  }

  public void clickViewProfile() {
    waitClickable(VIEW_PROFILE).click();
  }
}
