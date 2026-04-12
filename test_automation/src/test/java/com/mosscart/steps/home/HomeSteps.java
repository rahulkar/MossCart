package com.mosscart.steps.home;

import com.mosscart.pages.HomePage;
import com.mosscart.pages.ProductsPage;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class HomeSteps {

  @Then("the storefront hero headline should be visible")
  public void heroHeadline() {
    if (!new HomePage().isHeroVisible()) {
      throw new AssertionError("Hero not visible");
    }
  }

  @Then("the hero marketing band should be rendered")
  public void heroBand() {
    new HomePage().assertHeroSectionPresent();
  }

  @Then("the Green Index pitch should appear on the home page")
  public void greenPitch() {
    new HomePage().assertGreenPitchVisible();
  }

  @Then("the value proposition cards should be listed")
  public void valueProps() {
    new HomePage().assertValuePropsVisible();
  }

  @Then("the featured product grid should be visible")
  public void featuredGrid() {
    new HomePage().assertFeaturedGridVisible();
  }

  @Then("featured product cards should expose Green Index scores")
  public void featuredEco() {
    new HomePage().assertFeaturedCardsExposeGreenIndex();
  }

  @When("the shopper uses the primary shop call-to-action")
  public void ctaShop() {
    new HomePage().open();
    new HomePage().goToProductsViaCta();
  }

  @Then("the product catalog page should load")
  public void catalogLoads() {
    new ProductsPage().assertLoaded();
  }

  @When("the shopper selects the first featured product from home")
  public void firstFeatured() {
    new HomePage().open();
    new HomePage().openFirstFeaturedProduct();
  }

  @Then("the product detail layout should appear")
  public void detailLayout() {
    new com.mosscart.pages.ProductDetailPage().assertCategoryLabelVisible();
  }
}
