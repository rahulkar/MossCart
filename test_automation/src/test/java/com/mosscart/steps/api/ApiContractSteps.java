package com.mosscart.steps.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.mosscart.api.ApiResponse;
import com.mosscart.api.MosscartApi;
import com.mosscart.support.ScenarioContext;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class ApiContractSteps {

  private final MosscartApi api = new MosscartApi();
  private ApiResponse lastResponse;
  private String registeredToken;
  private String registeredEmail;

  @Given("a fresh registered shopper via API")
  public void registerFresh() {
    registeredEmail = ScenarioContext.uniqueEmail("contract");
    var r = api.register("Contract User", registeredEmail, "TestPass123");
    registeredToken = r.token();
  }

  @When("the API receives a {string} request to {string} with no token")
  public void requestNoToken(String method, String path) {
    lastResponse = api.sendExpectingStatus(method, path, null, null);
  }

  @When("the API receives a {string} request to {string} with an invalid token")
  public void requestInvalidToken(String method, String path) {
    lastResponse = api.sendExpectingStatus(method, path, null, "not-a-valid-jwt");
  }

  @When("the API receives a {string} request to {string} with the registered token")
  public void requestWithToken(String method, String path) {
    lastResponse = api.sendExpectingStatus(method, path, null, registeredToken);
  }

  @When("the API receives a {string} request to {string} with body:")
  public void requestWithBody(String method, String path, String body) {
    String resolved = resolvePlaceholders(body);
    String token = path.startsWith("/api/users") ? registeredToken : null;
    lastResponse = api.sendExpectingStatus(method, path, resolved, token);
  }

  private String resolvePlaceholders(String body) {
    if (body == null) return null;
    if (registeredEmail != null && body.contains("REPLACE_EMAIL")) {
      return body.replace("REPLACE_EMAIL", registeredEmail);
    }
    return body;
  }

  @Then("the API response status should be {int}")
  public void assertStatus(int status) {
    assertThat(lastResponse.statusCode())
        .as("Expected status %d but got %d with body: %s", status, lastResponse.statusCode(), lastResponse.body())
        .isEqualTo(status);
  }

  @Then("the API response body should contain error code {string}")
  public void assertErrorCode(String code) {
    assertThat(lastResponse.body().toLowerCase()).contains("\"code\"");
    assertThat(lastResponse.body().toLowerCase()).contains("\"" + code.toLowerCase() + "\"");
  }

  @Then("the API response body should contain {string}")
  public void assertBodyContains(String fragment) {
    assertThat(lastResponse.body()).containsIgnoringCase(fragment);
  }
}
