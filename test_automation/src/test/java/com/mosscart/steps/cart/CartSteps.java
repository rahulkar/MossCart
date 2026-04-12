package com.mosscart.steps.cart;

import static org.assertj.core.api.Assertions.assertThat;

import com.mosscart.pages.CartPage;
import io.cucumber.datatable.DataTable;
import com.mosscart.pages.HomePage;
import com.mosscart.pages.LayoutNavPage;
import com.mosscart.pages.ProductDetailPage;
import com.mosscart.pages.ProductsPage;
import com.mosscart.support.ApiFixtures;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.util.List;
import java.util.Map;

public class CartSteps {

  @Given("a signed-in shopper with an empty cart")
  public void signedInEmpty() {
    ApiFixtures.registerAndInjectSession("Cart User", "cartuser");
  }

  @When("they add the first in-stock catalog item to the cart")
  public void addFirstInStock() {
    ProductsPage p = new ProductsPage();
    p.open();
    p.assertLoaded();
    p.openFirstProduct();
    new ProductDetailPage().addToCart();
    new ProductDetailPage().waitForAddSuccess();
  }

  @Then("the cart should list line items with totals")
  public void cartHasLines() {
    CartPage cart = new CartPage();
    cart.open();
    cart.assertHasLineItems();
    cart.assertTotalVisible();
  }

  @When("they remove the first line from the shopping cart")
  public void removeFirst() {
    CartPage cart = new CartPage();
    cart.open();
    cart.removeFirstLineItem();
  }

  @Then("the empty cart placeholder should display")
  public void emptyCart() {
    new CartPage().assertEmptyCartVisible();
  }

  @When("an anonymous visitor opens the cart route directly")
  public void guestOpensCart() {
    new CartPage().open();
  }

  @Then("the guest cart experience should prompt for authentication")
  public void guestPrompt() {
    new CartPage().assertGuestGateVisible();
  }

  @When("they proceed toward checkout from the cart")
  public void proceedCheckout() {
    CartPage cart = new CartPage();
    cart.open();
    cart.proceedToCheckout();
  }

  @When("they revisit the cart from the header after browsing home")
  public void revisitCartFromHeader() {
    new HomePage().open();
    new LayoutNavPage().clickNavCart();
  }

  @Then("the cart should still contain merchandise")
  public void stillHasMerch() {
    new CartPage().assertHasLineItems();
  }

  @When("they add a second SKU from search {string}")
  public void addSecond(String q) {
    ProductsPage p = new ProductsPage();
    p.open();
    p.search(q);
    p.openFirstProduct();
    new ProductDetailPage().addToCart();
    new ProductDetailPage().waitForAddSuccess();
  }

  @Then("the cart summary should show a non-zero total")
  public void nonzeroTotal() {
    CartPage cart = new CartPage();
    cart.open();
    cart.assertTotalVisible();
  }

  @When("they add the product from search {string} to the cart from the PDP")
  public void addFromSearchPdp(String q) {
    ProductsPage p = new ProductsPage();
    p.open();
    p.search(q);
    p.openFirstProduct();
    new ProductDetailPage().addToCart();
    new ProductDetailPage().waitForAddSuccess();
  }

  @When("they set the first cart line quantity to {int}")
  public void setFirstLineQty(int qty) {
    CartPage cart = new CartPage();
    cart.open();
    cart.setQuantityForFirstLine(qty);
  }

  @Then("the cart total in cents should be {int}")
  public void assertTotalCents(int cents) {
    CartPage cart = new CartPage();
    cart.open();
    cart.waitForTotalCents(cents);
    assertThat(cart.parseTotalCentsFromSummary()).isEqualTo(cents);
  }

  @Then("the first cart line should show quantity {int}")
  public void assertFirstLineQty(int qty) {
    CartPage cart = new CartPage();
    cart.open();
    cart.waitForFirstLineQuantity(qty);
    assertThat(cart.quantityDisplayedForFirstLine()).isEqualTo(qty);
  }

  @Then("the cart should include these lines:")
  public void cartIncludesLines(DataTable table) {
    CartPage cart = new CartPage();
    cart.open();
    List<Map<String, String>> rows = table.asMaps(String.class, String.class);
    List<CartPage.LineSnapshot> actual = cart.readLineSnapshots();
    for (Map<String, String> row : rows) {
      String needle = row.get("product_contains");
      int qty = Integer.parseInt(row.get("quantity").trim());
      boolean ok =
          actual.stream()
              .anyMatch(
                  line ->
                      line.productName().contains(needle) && line.quantity() == qty);
      assertThat(ok)
          .as("expected line containing %s with qty %d in %s", needle, qty, actual)
          .isTrue();
    }
  }
}
