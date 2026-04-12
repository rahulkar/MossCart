package com.mosscart.pages;

import java.util.ArrayList;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

public class CartPage extends BasePage {

  private static final By CHECKOUT_BTN = By.cssSelector("[data-testid='cart-checkout-btn']");
  private static final By CART_TITLE = By.cssSelector("[data-testid='cart-title']");
  private static final By CART_EMPTY = By.cssSelector("[data-testid='cart-empty']");
  private static final By CART_LINES = By.cssSelector("[data-testid='cart-lines']");
  private static final By LINE =
      By.cssSelector("[data-testid='cart-lines'] > li[data-testid^='cart-line-']");
  private static final By GUEST_GATE = By.cssSelector("[data-testid='page-cart-guest']");

  public void open() {
    openPath("/cart");
  }

  public void assertGuestGateVisible() {
    waitVisible(GUEST_GATE);
  }

  public void proceedToCheckout() {
    waitVisible(CART_TITLE);
    waitVisible(CHECKOUT_BTN).click();
  }

  public void assertEmptyCartVisible() {
    waitVisible(CART_EMPTY);
  }

  public void assertHasLineItems() {
    waitVisible(CART_LINES);
    List<WebElement> lines = driver.findElements(LINE);
    if (lines.isEmpty()) throw new AssertionError("Expected cart lines");
  }

  public void assertLineCountAtLeast(int min) {
    waitVisible(CART_LINES);
    List<WebElement> lines = driver.findElements(LINE);
    if (lines.size() < min) {
      throw new AssertionError("Expected at least " + min + " cart lines, got " + lines.size());
    }
  }

  public void removeFirstLineItem() {
    waitVisible(CART_LINES);
    List<WebElement> lines = driver.findElements(LINE);
    if (lines.isEmpty()) throw new IllegalStateException("No lines to remove");
    String testId = lines.get(0).getAttribute("data-testid");
    String id = testId.replace("cart-line-", "");
    waitVisible(By.cssSelector("[data-testid='cart-line-remove-" + id + "']")).click();
  }

  public void assertTotalVisible() {
    waitVisible(By.cssSelector("[data-testid='cart-total']"));
  }

  public String firstCartLineId() {
    waitVisible(CART_LINES);
    List<WebElement> lines = driver.findElements(LINE);
    if (lines.isEmpty()) {
      throw new AssertionError("No cart lines");
    }
    String testId = lines.get(0).getAttribute("data-testid");
    return testId.replace("cart-line-", "");
  }

  public void setQuantityForFirstLine(int qty) {
    String id = firstCartLineId();
    WebElement input = waitVisible(By.cssSelector("[data-testid='cart-line-qty-" + id + "']"));
    input.click();
    // Controlled React number inputs often snap back when cleared via keyboard; set the native
    // value and dispatch input so onChange runs reliably (see Cart.jsx).
    String v = String.valueOf(qty);
    ((JavascriptExecutor) driver)
        .executeScript(
            "const el = arguments[0]; const val = arguments[1];"
                + "const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"
                + " 'value');"
                + "desc.set.call(el, val);"
                + "el.dispatchEvent(new Event('input', { bubbles: true }));"
                + "el.dispatchEvent(new Event('change', { bubbles: true }));",
            input,
            v);
    input.sendKeys(Keys.TAB);
  }

  public int quantityDisplayedForFirstLine() {
    String id = firstCartLineId();
    String v =
        waitVisible(By.cssSelector("[data-testid='cart-line-qty-" + id + "']")).getAttribute("value");
    if (v == null || v.isBlank()) {
      throw new IllegalStateException("quantity input has no value");
    }
    return Integer.parseInt(v.trim());
  }

  public void waitForFirstLineQuantity(int expected) {
    wait.until(
        d -> {
          try {
            List<WebElement> lines = d.findElements(LINE);
            if (lines.isEmpty()) {
              return false;
            }
            String testId = lines.get(0).getAttribute("data-testid");
            String id = testId.replace("cart-line-", "");
            String v =
                d.findElement(By.cssSelector("[data-testid='cart-line-qty-" + id + "']"))
                    .getAttribute("value");
            return v != null && Integer.parseInt(v.trim()) == expected;
          } catch (Exception e) {
            return false;
          }
        });
  }

  public int parseTotalCentsFromSummary() {
    String t = waitVisible(By.cssSelector("[data-testid='cart-total']")).getText();
    return com.mosscart.support.Money.usdSnippetToCents(t);
  }

  public void waitForTotalCents(int cents) {
    wait.until(
        d -> {
          try {
            String t =
                d.findElement(By.cssSelector("[data-testid='cart-total']")).getText();
            return com.mosscart.support.Money.usdSnippetToCents(t) == cents;
          } catch (Exception e) {
            return false;
          }
        });
  }

  public record LineSnapshot(String productName, int quantity) {}

  public List<LineSnapshot> readLineSnapshots() {
    waitVisible(CART_LINES);
    List<WebElement> lines = driver.findElements(LINE);
    List<LineSnapshot> out = new ArrayList<>();
    for (WebElement li : lines) {
      String testId = li.getAttribute("data-testid");
      if (testId == null) {
        continue;
      }
      String id = testId.replace("cart-line-", "");
      String name =
          waitVisible(li, By.cssSelector("[data-testid='cart-line-name-" + id + "']")).getText();
      String qtyRaw =
          li.findElement(By.cssSelector("[data-testid='cart-line-qty-" + id + "']"))
              .getAttribute("value");
      int qty = Integer.parseInt(qtyRaw != null ? qtyRaw.trim() : "0");
      out.add(new LineSnapshot(name, qty));
    }
    return out;
  }
}
