package com.mosscart.pages;

import org.openqa.selenium.By;

public class HomePage extends BasePage {

  private static final By HERO_TITLE = By.cssSelector("[data-testid='home-hero-title']");
  private static final By HERO_SECTION = By.cssSelector("[data-testid='home-hero-section']");
  private static final By CTA_SHOP = By.cssSelector("[data-testid='home-cta-shop']");
  private static final By FEATURED_GRID = By.cssSelector("[data-testid='home-featured-grid']");
  private static final By VALUE_PROPS = By.cssSelector("[data-testid='home-value-props']");
  private static final By GREEN_PITCH = By.cssSelector("[data-testid='home-green-pitch']");
  private static final By NAV_LOGO = By.cssSelector("[data-testid='nav-logo']");

  public void open() {
    openPath("/");
  }

  public boolean isHeroVisible() {
    return waitVisible(HERO_TITLE).isDisplayed();
  }

  public void assertHeroSectionPresent() {
    waitVisible(HERO_SECTION);
  }

  public void assertGreenPitchVisible() {
    waitVisible(GREEN_PITCH);
  }

  public void assertValuePropsVisible() {
    waitVisible(VALUE_PROPS);
  }

  public void assertFeaturedGridVisible() {
    waitVisible(FEATURED_GRID);
  }

  public void goToProductsViaCta() {
    waitVisible(CTA_SHOP).click();
  }

  public void clickLogo() {
    waitVisible(NAV_LOGO).click();
  }

  public void openFirstFeaturedProduct() {
    waitVisible(FEATURED_GRID).findElements(By.cssSelector("a[href^='/products/']")).get(0).click();
  }
}
