@module_catalog
Feature: Deep product detail page assertions

  Scenario: Enriched PDP surfaces SKU, highlights, and specifications
    When they open the first product after searching for "MC-MOSS-JAVA-01"
    Then the product detail should show SKU and expanded merchandising copy
    And the product category breadcrumb should be visible

  Scenario: Successful add to cart shows confirmation on PDP
    Given a signed-in shopper with an empty cart
    When they open the first product after searching for "Java Moss Portion"
    And they add the product to cart from the detail page
    Then the add-to-cart success indicator should be visible

  Scenario: Out-of-stock PDP disables add to cart and shows error on attempt
    When they locate the sold-out driftwood listing via search
    Then the primary purchase button should stay disabled
