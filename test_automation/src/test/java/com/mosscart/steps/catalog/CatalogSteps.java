package com.mosscart.steps.catalog;

import com.mosscart.pages.ProductDetailPage;
import com.mosscart.pages.ProductsPage;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class CatalogSteps {

  @When("they filter the catalog by category {string}")
  public void filterCategory(String category) {
    ProductsPage p = new ProductsPage();
    p.open();
    p.assertLoaded();
    p.selectCategory(category);
  }

  @When("they set the eco filter to only five-star listings")
  public void ecoFive() {
    ProductsPage p = new ProductsPage();
    p.open();
    p.selectEcoMin("5");
  }

  @When("they set the eco filter to four or higher")
  public void ecoFourPlus() {
    ProductsPage p = new ProductsPage();
    p.open();
    p.selectEcoMin("4");
  }

  @When("they search the catalog for text {string}")
  public void searchText(String q) {
    ProductsPage p = new ProductsPage();
    p.open();
    p.search(q);
  }

  @Then("at least one product card should appear in the grid")
  public void atLeastOne() {
    ProductsPage p = new ProductsPage();
    p.waitForMinVisibleProductCards(1);
    if (p.visibleProductCardCount() < 1) {
      throw new AssertionError("Expected product cards");
    }
  }

  @Then("the catalog should report no matching products")
  public void noMatches() {
    new ProductsPage().assertEmptyFilterMessage();
  }

  @When("they drill into the first catalog card")
  public void firstCard() {
    ProductsPage p = new ProductsPage();
    p.open();
    p.openFirstProduct();
  }

  @When("they open the first listing that is missing marketing photography")
  public void missingPhoto() {
    ProductsPage p = new ProductsPage();
    p.open();
    p.openFirstProductWithMissingImage();
  }

  @Then("the product detail view should surface the Green Index badge")
  public void ecoBadge() {
    new ProductDetailPage().assertEcoBadgeVisible();
  }

  @Then("the gallery should render the placeholder state for missing artwork")
  public void placeholder() {
    new ProductDetailPage().assertImagePlaceholderVisible();
  }

  @When("they locate the sold-out driftwood listing via search")
  public void searchSoldOutDriftwood() {
    ProductsPage p = new ProductsPage();
    p.open();
    p.search("Showpiece Driftwood");
    p.openFirstProduct();
  }

  @When("they keep the {string} category selected and search for {string}")
  public void categoryThenSearch(String category, String q) {
    ProductsPage p = new ProductsPage();
    p.open();
    p.selectCategory(category);
    p.search(q);
  }

  @Then("stock messaging should read out of stock")
  public void oosMsg() {
    new ProductDetailPage().assertOutOfStockVisible();
  }

  @Then("the primary purchase button should stay disabled")
  public void addDisabled() {
    new ProductDetailPage().assertAddToCartDisabled();
  }

  @When("they clear eco filters back to any score")
  public void clearEco() {
    ProductsPage p = new ProductsPage();
    p.open();
    p.selectEcoMin("");
  }

  @Then("multiple product cards should be visible simultaneously")
  public void multipleCards() {
    ProductsPage p = new ProductsPage();
    p.waitForMinVisibleProductCards(2);
    if (p.visibleProductCardCount() < 2) {
      throw new AssertionError("Expected multiple cards");
    }
  }

  @When("they open the first product after searching for {string}")
  public void searchAndOpen(String q) {
    ProductsPage p = new ProductsPage();
    p.open();
    p.search(q);
    p.openFirstProduct();
  }

  @When("they add the product to cart from the detail page")
  public void addFromPdp() {
    ProductDetailPage d = new ProductDetailPage();
    d.addToCart();
    d.waitForAddSuccess();
  }

  @When("they add the product to cart from the detail page twice in succession")
  public void addFromPdpTwice() {
    ProductDetailPage d = new ProductDetailPage();
    d.addToCart();
    d.waitForAddSuccess();
    d.addToCart();
    d.waitForAddSuccess();
  }

  @When("they browse the catalog with category {string} and search text {string}")
  public void browseCategoryAndSearch(String category, String search) {
    ProductsPage p = new ProductsPage();
    p.open();
    p.assertLoaded();
    if ("All".equalsIgnoreCase(category)) {
      p.selectCategory("");
    } else {
      p.selectCategory(category);
    }
    p.search(search == null ? "" : search);
  }

  @Then("the catalog grid expectation is {string}")
  public void catalogGridExpectation(String expectation) {
    ProductsPage p = new ProductsPage();
    switch (expectation) {
      case "non_empty":
        p.waitForMinVisibleProductCards(1);
        if (p.visibleProductCardCount() < 1) {
          throw new AssertionError("Expected at least one product card");
        }
        break;
      case "empty":
        p.assertEmptyFilterMessage();
        break;
      default:
        throw new IllegalArgumentException("Unknown expectation: " + expectation);
    }
  }

  @When("they browse the catalog with category {string} and eco minimum score {string}")
  public void browseCategoryAndEco(String category, String ecoMin) {
    ProductsPage p = new ProductsPage();
    p.open();
    p.assertLoaded();
    p.selectCategory(category);
    p.selectEcoMin(ecoMin);
  }
}
