package com.mosscart.steps.journeys;

import com.mosscart.pages.CartPage;
import com.mosscart.pages.CheckoutPage;
import com.mosscart.pages.ProductDetailPage;
import com.mosscart.pages.ProductsPage;
import com.mosscart.pages.ProfilePage;
import com.mosscart.support.ApiFixtures;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class JourneySteps {

  @Given("a greenfield shopper begins the full purchase funnel")
  public void beginFunnel() {
    ApiFixtures.registerAndInjectSession("Journey User", "journey");
  }

  @When("they discover catalog inventory and add an in-stock unit")
  public void discoverAdd() {
    ProductsPage p = new ProductsPage();
    p.open();
    p.search("All-in-One Aquarium");
    p.openFirstProduct();
    new ProductDetailPage().addToCart();
    new ProductDetailPage().waitForAddSuccess();
  }

  @When("they finalize mock settlement from the cart")
  public void settle() {
    CartPage cart = new CartPage();
    cart.open();
    cart.proceedToCheckout();
    CheckoutPage co = new CheckoutPage();
    co.assertLoaded();
    co.fillShippingAndPay();
  }

  @Then("their profile timeline should include the closed order")
  public void timeline() {
    ProfilePage prof = new ProfilePage();
    prof.assertLoaded();
    prof.assertHasOrderRow();
  }
}
