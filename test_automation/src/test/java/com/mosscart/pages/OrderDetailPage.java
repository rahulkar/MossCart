package com.mosscart.pages;

import static org.assertj.core.api.Assertions.assertThat;

import com.mosscart.support.Money;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class OrderDetailPage extends BasePage {

  public void clickBackToProfile() {
    waitVisible(By.cssSelector("[data-testid='order-back']")).click();
  }

  public void assertReceiptVisible() {
    waitVisible(By.cssSelector("[data-testid='order-detail-title']"));
    waitVisible(By.cssSelector("[data-testid='order-detail-total']"));
  }

  public void assertShippingBlockVisible() {
    waitVisible(By.cssSelector("[data-testid='order-detail-shipping']"));
  }

  public void assertHasLineItems() {
    wait.until(
        ExpectedConditions.presenceOfElementLocated(
            By.cssSelector("[data-testid^='order-line-']")));
  }

  public void assertTotalCents(int expectedCents) {
    String text = waitVisible(By.cssSelector("[data-testid='order-detail-total']")).getText();
    assertThat(Money.usdSnippetToCents(text)).isEqualTo(expectedCents);
  }
}
