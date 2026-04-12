package com.mosscart.steps.navigation;

import com.mosscart.pages.HomePage;
import com.mosscart.pages.LayoutNavPage;
import com.mosscart.pages.ProductsPage;
import com.mosscart.pages.RegisterPage;
import com.mosscart.support.ApiFixtures;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class NavigationSteps {

  @Given("the shopper landed from any page on the home route")
  public void onHome() {
    new HomePage().open();
  }

  @When("they use the main menu to open products")
  public void navProducts() {
    new LayoutNavPage().clickNavProducts();
  }

  @Then("the catalog chrome should be visible")
  public void catalogChrome() {
    new ProductsPage().assertLoaded();
  }

  @When("they jump to cart from the header")
  public void navCart() {
    new LayoutNavPage().clickNavCart();
  }

  @When("they choose the sign up navigation item")
  public void navSignup() {
    new LayoutNavPage().clickNavRegister();
  }

  @Then("the registration marketing form should display")
  public void regForm() {
    new RegisterPage().assertRegisterFormVisible();
  }

  @When("they return home through the brand logo")
  public void logoHome() {
    new ProductsPage().open();
    new HomePage().clickLogo();
  }

  @Then("the marketing hero should render again")
  public void heroAgain() {
    new HomePage().assertHeroSectionPresent();
  }

  @Given("an authenticated shopper is browsing products")
  public void authBrowsing() {
    ApiFixtures.registerAndInjectSession("Nav User", "nav");
    new ProductsPage().open();
  }

  @When("they open profile from the top navigation")
  public void navProfile() {
    new LayoutNavPage().clickNavProfile();
  }
}