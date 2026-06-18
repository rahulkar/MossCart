package com.mosscart.steps.checkout;

import com.mosscart.pages.CartPage;
import com.mosscart.pages.CheckoutPage;
import com.mosscart.pages.ProfilePage;
import com.mosscart.support.ApiFixtures;
import com.mosscart.support.ScenarioContext;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class CheckoutSteps {

  @Given("a shopper ready for checkout with one item in cart")
  public void readyCheckout() {
    ApiFixtures.registerInjectWithOneInStockLine();
  }

  @Given("a shopper ready for checkout with product from search {string}")
  public void readyCheckoutFromSearch(String skuQuery) {
    ApiFixtures.registerInjectWithProductSearch("Outline Shopper", "outline", skuQuery);
  }

  @When("they complete shipping fields and confirm mock payment")
  public void pay() {
    CartPage cart = new CartPage();
    cart.open();
    cart.proceedToCheckout();
    CheckoutPage co = new CheckoutPage();
    co.assertLoaded();
    co.fillShippingAndPay();
  }

  @Then("the account profile should reflect the new order")
  public void profileOrder() {
    ProfilePage prof = new ProfilePage();
    prof.open();
    prof.assertLoaded();
    prof.assertHasOrderRow();
  }

  @When("a signed-in shopper opens checkout with an empty basket")
  public void emptyBasketCheckout() {
    ApiFixtures.registerAndInjectSession("Empty Co", "emptyco");
    new CheckoutPage().open();
  }

  @Then("checkout should advise that the cart has no items")
  public void checkoutEmptyMsg() {
    new CheckoutPage().assertEmptyCartMessage();
  }

  @When("an anonymous user deep-links to checkout")
  public void guestCheckout() {
    new CheckoutPage().open();
  }

  @Then("checkout should ask the visitor to authenticate first")
  public void checkoutGuest() {
    new CheckoutPage().assertGuestPrompt();
  }

  @Given("a shopper is on checkout with merchandise in the basket")
  public void checkoutWithMerch() {
    ApiFixtures.registerInjectWithOneInStockLine();
    CartPage cart = new CartPage();
    cart.open();
    cart.proceedToCheckout();
    new CheckoutPage().assertLoaded();
  }

  @When("they try paying after clearing all shipping inputs")
  public void clearShipPay() {
    new CheckoutPage().submitEmptyRequiredFields();
  }

  @Then("the browser should keep focus on the checkout experience")
  public void stillCheckout() {
    new CheckoutPage().assertLoaded();
  }

  @Given("a shopper ready for checkout with lava rock in cart")
  public void readyLavaRock() {
    ApiFixtures.registerInjectWithProductSearch("HP User", "hp", "Lava Rock");
  }

  @When("they run through mock settlement once")
  public void settleOnce() {
    CartPage cart = new CartPage();
    cart.open();
    cart.proceedToCheckout();
    new CheckoutPage().assertLoaded();
    new CheckoutPage().fillShippingAndPay();
  }

  @Given("checkout will simulate a declined card authorization")
  public void simulateDecline() {
    ScenarioContext.setSimulatePaymentFailure(true);
  }

  @Then("they should remain on checkout with an error message")
  public void remainOnCheckoutWithError() {
    new CheckoutPage().assertStillOnCheckoutUrl();
    new CheckoutPage().assertPaymentDeclinedNoticeVisible();
  }

  @Then("the cart should still hold the merchandise after the decline")
  public void cartStillHasLinesAfterDecline() {
    new CartPage().open();
    new CartPage().assertHasLineItems();
  }

  @Then("the profile order history should show the failed payment attempt")
  public void profileShowsFailedPayment() {
    new ProfilePage().open();
    new ProfilePage().assertLatestOrderPaymentStatusContains("failed");
  }
}
