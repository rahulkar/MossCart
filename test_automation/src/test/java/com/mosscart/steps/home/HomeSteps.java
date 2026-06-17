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

  @Then("the storefront hero subtitle should be visible")
  public void heroSubtitle() {
    new HomePage().assertHeroSubtitleVisible();
  }

  @Then("the individual value proposition cards should be visible")
  public void valueCards() {
    new HomePage().assertValueCardsVisible();
  }

  @Then("the site footer should be visible")
  public void footerVisible() {
    new HomePage().assertFooterVisible();
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

  @When("they open the Learn more modal")
  public void openLearnMore() {
    new HomePage().openLearnMoreModal();
  }

  @Then("the Learn more modal should be visible")
  public void learnMoreVisible() {
    new HomePage().assertLearnMoreModalVisible();
  }

  @When("they close the Learn more modal")
  public void closeLearnMore() {
    new HomePage().closeLearnMoreModal();
  }

  @Then("the Learn more modal should be hidden")
  public void learnMoreHidden() {
    new HomePage().assertLearnMoreModalHidden();
  }

  @When("they follow the shop link inside the modal")
  public void modalShopLink() {
    new HomePage().followLearnMoreShopLink();
  }

  @When("they navigate the featured carousel to the next slide")
  public void nextFeaturedSlide() {
    HomePage h = new HomePage();
    int before = h.activeFeaturedSlideIndex();
    h.clickFeaturedNext();
    h.assertActiveSlideChanged(before);
  }

  @Then("the featured carousel should display a different active slide")
  public void carouselChanged() {
    // assertion handled in the action step
  }
}
