package com.mosscart.steps.common;

import com.mosscart.pages.CartPage;
import com.mosscart.pages.CheckoutPage;
import com.mosscart.pages.HomePage;
import com.mosscart.pages.LoginPage;
import com.mosscart.pages.ProductsPage;
import com.mosscart.pages.ProfilePage;
import com.mosscart.pages.RegisterPage;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;

public class CommonSteps {

  @Given("the shopper navigates to the home page")
  public void navHome() {
    new HomePage().open();
  }

  @Given("the shopper navigates to the product catalog")
  public void navProducts() {
    new ProductsPage().open();
    new ProductsPage().assertLoaded();
  }

  @Given("the shopper navigates to the cart page")
  public void navCart() {
    new CartPage().open();
  }

  @Given("the shopper navigates to checkout")
  public void navCheckout() {
    new CheckoutPage().open();
  }

  @Given("the shopper navigates to the profile page")
  public void navProfile() {
    new ProfilePage().open();
  }

  @Given("the shopper navigates to the login page")
  public void navLogin() {
    new LoginPage().open();
  }

  @Given("the shopper navigates to the registration page")
  public void navRegister() {
    new RegisterPage().open();
  }

  @When("they navigate to the product catalog")
  public void whenNavProducts() {
    new ProductsPage().open();
    new ProductsPage().assertLoaded();
  }
}
