package com.mosscart.steps.auth;

import com.mosscart.pages.LayoutNavPage;
import com.mosscart.pages.LoginPage;
import com.mosscart.pages.ProfilePage;
import com.mosscart.pages.RegisterPage;
import com.mosscart.support.ApiFixtures;
import com.mosscart.support.ScenarioContext;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class AuthSteps {

  @Given("a new shopper completes registration with valid credentials")
  public void registerFresh() {
    String email = ScenarioContext.uniqueEmail("buyer");
    String password = "TestPass123";
    ScenarioContext.setCredentials("Regression Buyer", email, password);
    RegisterPage reg = new RegisterPage();
    reg.open();
    reg.register("Regression Buyer", email, password);
  }

  @When("the shopper signs out from the navigation bar")
  public void signOutNav() {
    new LayoutNavPage().clickLogout();
  }

  @Then("the public login entry point should be visible")
  public void loginVisible() {
    new LayoutNavPage().assertNavLoginVisible();
  }

  @Then("the authenticated profile link should be visible in the header")
  public void profileLink() {
    new LayoutNavPage().assertNavProfileVisible();
  }

  @Then("the login surface should be ready for input")
  public void loginReady() {
    new LoginPage().assertOnLoginPage();
  }

  @When("the shopper signs in using the saved email and password")
  public void signInSaved() {
    LoginPage login = new LoginPage();
    login.open();
    login.login(ScenarioContext.getEmail(), ScenarioContext.getPassword());
    new LayoutNavPage().assertNavProfileVisible();
  }

  @Given("the shopper is on the registration form")
  public void onRegisterForm() {
    new RegisterPage().open();
  }

  @When("they submit registration with a duplicate email")
  public void duplicateEmail() {
    String email = ScenarioContext.uniqueEmail("dup");
    RegisterPage reg = new RegisterPage();
    reg.open();
    reg.register("First User", email, "TestPass123");
    new LayoutNavPage().clickLogout();
    reg.open();
    reg.fillAndSubmit("Second User", email, "TestPass123");
  }

  @Then("an email conflict message should be displayed")
  public void conflictMsg() {
    new RegisterPage().assertRegistrationErrorVisible();
  }

  @When("they attempt login with a wrong password")
  public void wrongPassword() {
    String email = ScenarioContext.uniqueEmail("badlogin");
    RegisterPage reg = new RegisterPage();
    reg.open();
    reg.register("Pwd User", email, "TestPass123");
    new LayoutNavPage().clickLogout();
    LoginPage login = new LoginPage();
    login.open();
    login.login(email, "WrongPass!!!");
  }

  @Then("the login form should show an authentication error")
  public void loginErr() {
    new LoginPage().assertLoginErrorVisible();
  }

  @When("they open the login screen again after a failed attempt")
  public void openLoginAgain() {
    new LoginPage().open();
    new LoginPage().assertOnLoginPage();
  }

  @Given("the shopper is registered via API and authenticated in the browser")
  public void apiAuthenticatedShopper() {
    ApiFixtures.registerAndInjectSession("API Buyer", "apibuyer");
  }

  @When("they open the profile page from the navigation bar")
  public void openProfileFromNav() {
    new LayoutNavPage().clickNavProfile();
    new ProfilePage().assertLoaded();
  }
}
