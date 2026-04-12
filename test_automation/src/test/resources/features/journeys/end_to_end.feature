@module_journeys @regression
Feature: Cross-module buyer journeys

  Scenario: Greenfield buyer completes first purchase
    Given a greenfield shopper begins the full purchase funnel
    When they discover catalog inventory and add an in-stock unit
    And they finalize mock settlement from the cart
    Then their profile timeline should include the closed order

  Scenario: Repeat buyer can stack another SKU post-checkout
    Given a greenfield shopper begins the full purchase funnel
    When they discover catalog inventory and add an in-stock unit
    And they finalize mock settlement from the cart
    And they navigate to the product catalog
    And they open the first product after searching for "Java Moss"
    And they add the product to cart from the detail page
    And they proceed toward checkout from the cart
    And they complete shipping fields and confirm mock payment
    Then their profile timeline should include the closed order

  Scenario: Catalog discovery precedes authentication-less browsing
    Given the shopper navigates to the product catalog
    When they filter the catalog by category "Moss"
    Then at least one product card should appear in the grid
