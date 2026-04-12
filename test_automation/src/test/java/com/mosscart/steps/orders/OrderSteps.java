package com.mosscart.steps.orders;

import com.mosscart.api.MosscartApi;
import com.mosscart.pages.CartPage;
import com.mosscart.pages.CheckoutPage;
import com.mosscart.pages.OrderDetailPage;
import com.mosscart.pages.ProfilePage;
import com.mosscart.support.ApiFixtures;
import com.mosscart.support.ScenarioContext;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class OrderSteps {

  @Given("a shopper who already completed a purchase")
  public void purchased() {
    ApiFixtures.registerAndInjectSession("Order User", "ord");
    ApiFixtures.addToCartViaApiForCurrentUser("Java Moss", 1);
    MosscartApi api = new MosscartApi();
    api.checkout(
        ScenarioContext.getToken(),
        "Order User",
        "100 Ship Rd",
        "Shipville",
        "90210",
        false);
  }

  @When("they open the first receipt link from profile history")
  public void openReceipt() {
    new ProfilePage().open();
    new ProfilePage().openFirstOrderReceipt();
  }

  @Then("the order receipt view should list purchased lines")
  public void receiptLines() {
    new OrderDetailPage().assertReceiptVisible();
    new OrderDetailPage().assertHasLineItems();
  }

  @Then("fulfillment address data should be shown on the receipt")
  public void shipBlock() {
    new OrderDetailPage().assertShippingBlockVisible();
  }

  @When("they navigate back toward account overview")
  public void backProfile() {
    new OrderDetailPage().clickBackToProfile();
    new ProfilePage().assertLoaded();
  }

  @Given("a signed-in shopper with multiple SKUs in the cart via API")
  public void multiSkuCart() {
    ApiFixtures.registerAndInjectSession("Multi SKU User", "multisku");
    var a = ApiFixtures.addToCartViaApiForCurrentUser("Java Moss", 1);
    var b = ApiFixtures.addToCartViaApiForCurrentUser("Lava Rock", 2);
    ScenarioContext.setExpectedTotalCents(a.priceCents() + b.priceCents() * 2);
  }

  @When("they pay from checkout after reviewing the combined order summary")
  public void payMultiFromCheckout() {
    CartPage cart = new CartPage();
    cart.open();
    cart.assertLineCountAtLeast(2);
    cart.proceedToCheckout();
    CheckoutPage co = new CheckoutPage();
    co.assertLoaded();
    co.assertSummaryLineCountAtLeast(2);
    co.fillShippingAndPay();
  }

  @When("they open the latest order receipt from the profile")
  public void openLatestReceipt() {
    new ProfilePage().open();
    new ProfilePage().openFirstOrderReceipt();
  }

  @Then("the receipt total should match the expected checkout total")
  public void receiptTotalMatches() {
    Integer expected = ScenarioContext.getExpectedTotalCents();
    if (expected == null) {
      throw new IllegalStateException("expected total not set in scenario context");
    }
    new OrderDetailPage().assertTotalCents(expected);
  }
}
