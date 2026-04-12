package com.mosscart.steps.profile;

import com.mosscart.pages.LayoutNavPage;
import com.mosscart.pages.ProfilePage;
import com.mosscart.support.ApiFixtures;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class ProfileSteps {

  @Given("a shopper viewing their profile dashboard")
  public void onProfile() {
    ApiFixtures.registerAndInjectSession("Profile User", "prof");
    new ProfilePage().open();
    new ProfilePage().assertLoaded();
  }

  @When("they start editing profile details")
  public void startEdit() {
    new ProfilePage().startEditProfile();
  }

  @When("they cancel profile edits")
  public void cancelEdit() {
    new ProfilePage().cancelEditProfile();
  }

  @Then("the read-only profile card should return")
  public void cardBack() {
    new ProfilePage().assertLoaded();
  }

  @When("they save an updated display name {string}")
  public void saveName(String name) {
    new ProfilePage().saveProfileWithName(name);
  }

  @Then("the profile header should still be visible")
  public void headerVisible() {
    new ProfilePage().assertLoaded();
  }

  @Then("the membership profile heading should appear")
  public void membershipHeading() {
    new ProfilePage().assertLoaded();
  }

  @When("they log out from the profile screen")
  public void logoutProfile() {
    new ProfilePage().logoutFromProfile();
  }

  @Then("the storefront should treat them as signed out")
  public void signedOut() {
    new LayoutNavPage().assertNavLoginVisible();
  }
}
