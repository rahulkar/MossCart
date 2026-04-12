package com.mosscart.pages;

import org.openqa.selenium.By;

public class LayoutNavPage extends BasePage {

  public void clickNavHome() {
    waitVisible(By.cssSelector("[data-testid='nav-home']")).click();
  }

  public void clickNavProducts() {
    waitVisible(By.cssSelector("[data-testid='nav-products']")).click();
  }

  public void clickNavCart() {
    waitVisible(By.cssSelector("[data-testid='nav-cart']")).click();
  }

  public void clickNavProfile() {
    waitVisible(By.cssSelector("[data-testid='nav-profile']")).click();
  }

  public void clickNavLogin() {
    waitVisible(By.cssSelector("[data-testid='nav-login']")).click();
  }

  public void clickNavRegister() {
    waitVisible(By.cssSelector("[data-testid='nav-register']")).click();
  }

  public void clickLogout() {
    waitVisible(By.cssSelector("[data-testid='nav-logout']")).click();
  }

  public void assertNavLoginVisible() {
    waitVisible(By.cssSelector("[data-testid='nav-login']"));
  }

  public void assertNavProfileVisible() {
    waitVisible(By.cssSelector("[data-testid='nav-profile']"));
  }
}
