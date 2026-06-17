package com.mosscart.steps.profile;

import static org.assertj.core.api.Assertions.assertThat;

import com.mosscart.pages.LayoutNavPage;
import com.mosscart.pages.ProfilePage;
import com.mosscart.support.ApiFixtures;
import com.mosscart.support.ScenarioContext;
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

  @Then("the profile email display should contain {string}")
  public void emailDisplayContains(String fragment) {
    assertThat(new ProfilePage().getEmailDisplayText()).contains(fragment);
  }

  @Then("the profile email input should be visible")
  public void emailInputVisible() {
    new ProfilePage().assertEmailInputVisible();
  }

  @When("they enter an invalid email {string}")
  public void enterInvalidEmail(String email) {
    new ProfilePage().enterEmail(email);
  }

  @Then("the profile email input should report a validation error")
  public void emailInputInvalid() {
    new ProfilePage().assertEmailInputInvalid();
  }

  @When("they enter a valid new email")
  public void enterValidNewEmail() {
    String email = ScenarioContext.uniqueEmail("profile");
    ScenarioContext.setNewEmail(email);
    new ProfilePage().enterEmail(email);
  }

  @When("they save the profile changes")
  public void saveProfile() {
    new ProfilePage().saveProfileChanges();
  }

  @Then("the profile email display should contain the new email")
  public void emailDisplayHasNewEmail() {
    String email = ScenarioContext.getNewEmail();
    if (email == null) {
      throw new IllegalStateException("No new email stored in scenario context");
    }
    assertThat(new ProfilePage().getEmailDisplayText()).isEqualTo(email);
  }
}
