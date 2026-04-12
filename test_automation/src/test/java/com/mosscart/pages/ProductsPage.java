package com.mosscart.pages;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

public class ProductsPage extends BasePage {

  private static final By PRODUCTS_TITLE = By.cssSelector("[data-testid='products-title']");
  private static final By PRODUCT_CARD = By.cssSelector("[data-testid^='product-card-']");
  private static final By CATEGORY_FILTER = By.cssSelector("[data-testid='products-category-filter']");
  private static final By ECO_FILTER = By.cssSelector("[data-testid='products-eco-filter']");
  private static final By SEARCH = By.cssSelector("[data-testid='products-search']");
  private static final By EMPTY = By.cssSelector("[data-testid='products-empty']");
  private static final By CARD_MISSING_IMAGE = By.cssSelector("[data-image-state='missing']");

  public void open() {
    openPath("/products");
  }

  public void assertLoaded() {
    waitVisible(PRODUCTS_TITLE);
  }

  public void openFirstProduct() {
    List<WebElement> cards =
        wait.until(
            d -> {
              List<WebElement> found = d.findElements(PRODUCT_CARD);
              return found.isEmpty() ? null : found;
            });
    cards.get(0).click();
  }

  public void openFirstProductWithMissingImage() {
    waitVisible(PRODUCTS_TITLE);
    WebElement card =
        wait.until(
            d -> {
              List<WebElement> found = d.findElements(CARD_MISSING_IMAGE);
              return found.isEmpty() ? null : found.get(0);
            });
    card.click();
  }

  public void search(String text) {
    WebElement el = waitVisible(SEARCH);
    el.clear();
    el.sendKeys(text);
  }

  public void selectCategory(String visibleTextOrEmpty) {
    Select sel = new Select(waitVisible(CATEGORY_FILTER));
    if (visibleTextOrEmpty == null || visibleTextOrEmpty.isBlank()) {
      sel.selectByVisibleText("All categories");
    } else {
      sel.selectByVisibleText(visibleTextOrEmpty);
    }
  }

  public void selectEcoMin(String value) {
    Select sel = new Select(waitVisible(ECO_FILTER));
    switch (value) {
      case "4":
        sel.selectByVisibleText("4+ (greener)");
        break;
      case "5":
        sel.selectByVisibleText("5 only");
        break;
      default:
        sel.selectByVisibleText("Any");
    }
  }

  public int visibleProductCardCount() {
    return driver.findElements(PRODUCT_CARD).size();
  }

  /**
   * Waits until the grid reflects a settled fetch (cards can be 0 while React Query loads a new
   * query key after category/search changes).
   */
  public void waitForMinVisibleProductCards(int min) {
    if (min <= 0) {
      return;
    }
    wait.until(
        d -> {
          List<WebElement> loaders = d.findElements(By.cssSelector("[data-testid='products-loading']"));
          if (loaders.stream().anyMatch(WebElement::isDisplayed)) {
            return false;
          }
          return d.findElements(PRODUCT_CARD).size() >= min;
        });
  }

  public void assertEmptyFilterMessage() {
    waitVisible(EMPTY);
  }

  /**
   * Asserts merchandising copy under {@code data-testid^='product-card-eco-'} matches the catalog filter.
   * Kept in sync with DESIGN.md-driven UI: label must stay {@code Green index: N/5} (see ProductCard.jsx).
   */
  public void assertEcoScoreOnFirstCard(String minScore) {
    waitVisible(PRODUCTS_TITLE);
    List<WebElement> cards = driver.findElements(PRODUCT_CARD);
    if (cards.isEmpty()) throw new AssertionError("No product cards");
    String id = cards.get(0).getAttribute("data-testid").replace("product-card-", "");
    WebElement eco = waitVisible(By.cssSelector("[data-testid='product-card-eco-" + id + "']"));
    String text = eco.getText().replace('\n', ' ').trim();
    if ("5".equals(minScore)) {
      if (!text.toLowerCase().contains("green index: 5/5")) {
        throw new AssertionError("Expected first card to show Green index 5/5, was: " + text);
      }
    }
  }
}
