package com.mosscart.pages;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class HomePage extends BasePage {

  private static final By HERO_TITLE = By.cssSelector("[data-testid='home-hero-title']");
  private static final By HERO_SUBTITLE = By.cssSelector("[data-testid='home-hero-subtitle']");
  private static final By HERO_SECTION = By.cssSelector("[data-testid='home-hero-section']");
  private static final By CTA_SHOP = By.cssSelector("[data-testid='home-cta-shop']");
  private static final By FEATURED_GRID = By.cssSelector("[data-testid='home-featured-grid']");
  private static final By VALUE_PROPS = By.cssSelector("[data-testid='home-value-props']");
  private static final By VALUE_CARD_FAST = By.cssSelector("[data-testid='home-value-fast']");
  private static final By VALUE_CARD_MOCK = By.cssSelector("[data-testid='home-value-mock']");
  private static final By VALUE_CARD_ECO = By.cssSelector("[data-testid='home-value-eco']");
  private static final By GREEN_PITCH = By.cssSelector("[data-testid='home-green-pitch']");
  private static final By FOOTER = By.cssSelector("[data-testid='footer']");
  private static final By LEARN_MORE_BTN = By.cssSelector("[data-testid='home-learn-more-btn']");
  private static final By LEARN_MORE_MODAL = By.cssSelector("[data-testid='home-learn-more-modal']");
  private static final By LEARN_MORE_CLOSE = By.cssSelector("[data-testid='home-learn-more-close']");
  private static final By LEARN_MORE_SHOP = By.cssSelector("[data-testid='home-learn-more-shop']");
  private static final By FEATURED_PREV = By.cssSelector("[data-testid='home-featured-prev']");
  private static final By FEATURED_NEXT = By.cssSelector("[data-testid='home-featured-next']");
  private static final By FEATURED_DOTS = By.cssSelector("[data-testid^='home-featured-dot-']");
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

  public void assertHeroSubtitleVisible() {
    waitVisible(HERO_SUBTITLE);
  }

  public void assertValueCardsVisible() {
    waitVisible(VALUE_CARD_FAST);
    waitVisible(VALUE_CARD_MOCK);
    waitVisible(VALUE_CARD_ECO);
  }

  public void assertFooterVisible() {
    waitVisible(FOOTER);
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

  public void assertFeaturedCardsExposeGreenIndex() {
    WebElement grid = waitVisible(FEATURED_GRID);
    List<WebElement> eco = grid.findElements(By.cssSelector("[data-testid^='product-card-eco-']"));
    if (eco.isEmpty()) {
      throw new AssertionError("Expected Green Index row on a featured card");
    }
  }

  public void openLearnMoreModal() {
    waitVisible(LEARN_MORE_BTN).click();
  }

  public void assertLearnMoreModalVisible() {
    waitVisible(LEARN_MORE_MODAL);
  }

  public void assertLearnMoreModalHidden() {
    waitInvisible(LEARN_MORE_MODAL);
  }

  public void closeLearnMoreModal() {
    waitVisible(LEARN_MORE_CLOSE).click();
  }

  public void followLearnMoreShopLink() {
    waitVisible(LEARN_MORE_SHOP).click();
  }

  public void clickFeaturedNext() {
    waitVisible(FEATURED_NEXT).click();
  }

  public int activeFeaturedSlideIndex() {
    List<WebElement> dots = driver.findElements(FEATURED_DOTS);
    for (int i = 0; i < dots.size(); i++) {
      String cls = dots.get(i).getAttribute("class");
      if (cls != null && cls.contains("w-6")) {
        return i;
      }
    }
    return 0;
  }

  public void assertActiveSlideChanged(int previousIndex) {
    wait.until(
        d -> {
          List<WebElement> dots = d.findElements(FEATURED_DOTS);
          if (dots.size() <= 1) return true; // no meaningful change possible
          for (int i = 0; i < dots.size(); i++) {
            String cls = dots.get(i).getAttribute("class");
            if (cls != null && cls.contains("w-6") && i != previousIndex) {
              return true;
            }
          }
          return false;
        });
  }
}
