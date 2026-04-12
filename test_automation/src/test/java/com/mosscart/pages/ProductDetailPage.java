package com.mosscart.pages;

import org.openqa.selenium.By;

public class ProductDetailPage extends BasePage {

  private static final By ADD_TO_CART = By.cssSelector("[data-testid='product-add-to-cart']");
  private static final By PRODUCT_NAME = By.cssSelector("[data-testid='product-name']");
  private static final By ECO_BADGE = By.cssSelector("[data-testid='product-eco-badge']");
  private static final By ECO_SCORE = By.cssSelector("[data-testid='product-eco-score']");
  private static final By IMAGE_PLACEHOLDER = By.cssSelector("[data-testid='product-image-placeholder']");
  private static final By CATEGORY = By.cssSelector("[data-testid='product-category']");

  public void addToCart() {
    waitVisible(PRODUCT_NAME);
    waitVisible(ADD_TO_CART).click();
  }

  public void waitForAddSuccess() {
    waitVisible(By.cssSelector("[data-testid='product-add-success']"));
  }

  public void assertEcoBadgeVisible() {
    waitVisible(ECO_BADGE);
    waitVisible(ECO_SCORE);
  }

  public void assertCategoryLabelVisible() {
    waitVisible(CATEGORY);
  }

  public void assertImagePlaceholderVisible() {
    waitVisible(IMAGE_PLACEHOLDER);
  }

  public void assertAddToCartDisabled() {
    waitVisible(PRODUCT_NAME);
    if (waitVisible(ADD_TO_CART).isEnabled()) {
      throw new AssertionError("Add to cart should be disabled");
    }
  }

  public void assertOutOfStockVisible() {
    wait.until(d -> d.findElement(By.cssSelector("[data-testid='product-stock']")).getText().contains("Out of stock"));
  }
}
