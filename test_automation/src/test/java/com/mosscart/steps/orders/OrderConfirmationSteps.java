package com.mosscart.steps.orders;

import com.mosscart.pages.OrderConfirmationPage;
import com.mosscart.pages.ProfilePage;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class OrderConfirmationSteps {

  @Then("the order confirmation page should display")
  public void confirmationDisplays() {
    OrderConfirmationPage page = new OrderConfirmationPage();
    page.assertOnOrderConfirmationRoute();
    page.assertLoaded();
  }

  @Then("the order confirmation should show shipping details")
  public void confirmationShowsShipping() {
    new OrderConfirmationPage().assertShippingNameVisible();
  }

  @When("they proceed to their profile from the order confirmation")
  public void goToProfileFromConfirmation() {
    new OrderConfirmationPage().clickViewProfile();
  }
}
