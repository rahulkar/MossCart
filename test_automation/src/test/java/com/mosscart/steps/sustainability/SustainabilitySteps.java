package com.mosscart.steps.sustainability;

import com.mosscart.pages.HomePage;
import com.mosscart.pages.ProductDetailPage;
import com.mosscart.pages.ProductsPage;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class SustainabilitySteps {

  @When("they inspect eco labels on the catalog grid")
  public void inspectGrid() {
    ProductsPage p = new ProductsPage();
    p.open();
    p.assertLoaded();
  }

  @Then("each visible card should expose a Green Index score")
  public void cardsEco() {
    new ProductsPage().assertEcoScoresMatch("any");
  }

  @When("they open any stocked product from the eco-heavy Moss category")
  public void openHomeEco() {
    ProductsPage p = new ProductsPage();
    p.open();
    p.selectCategory("Moss");
    p.openFirstProduct();
  }

  @Then("the detail sheet should highlight the Green Index")
  public void detailEco() {
    new ProductDetailPage().assertEcoBadgeVisible();
  }

  @Then("the home page sustainability blurb should mention the Green Index")
  public void homeBlurb() {
    new HomePage().open();
    new HomePage().assertGreenPitchVisible();
  }

  @When("they tighten filters to only five-star eco listings")
  public void fiveStar() {
    ProductsPage p = new ProductsPage();
    p.open();
    p.selectEcoMin("5");
  }

  @Then("every remaining card should still print an eco score row")
  public void stillEcoRows() {
    ProductsPage p = new ProductsPage();
    p.waitForMinVisibleProductCards(1);
    if (p.visibleProductCardCount() < 1) {
      throw new AssertionError("Expected eco-filtered products");
    }
    p.assertEcoScoresMatch("5");
  }
}
