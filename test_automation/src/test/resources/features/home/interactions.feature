@module_home
Feature: Home page interactions

  Scenario: Learn more modal opens and closes
    Given the shopper navigates to the home page
    When they open the Learn more modal
    Then the Learn more modal should be visible
    When they close the Learn more modal
    Then the Learn more modal should be hidden

  Scenario: Learn more modal offers a shop link
    Given the shopper navigates to the home page
    When they open the Learn more modal
    And they follow the shop link inside the modal
    Then the product catalog page should load

  Scenario: Featured carousel navigation moves the row
    Given the shopper navigates to the home page
    When they navigate the featured carousel to the next slide
    Then the featured carousel should display a different active slide
