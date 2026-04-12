@module_journeys @regression
Feature: Research-heavy paths before settlement

  Composed steps only (no hidden mega-Givens) to exercise filters, navigation, and checkout.

  Scenario: Eco-filtered moss plus hardscape SKU ends in a placed order
    Given a signed-in shopper with an empty cart
    When they browse the catalog with category "Moss" and eco minimum score "5"
    And they drill into the first catalog card
    And they add the product to cart from the detail page
    And they navigate to the product catalog
    And they open the first product after searching for "Dragon Stone"
    And they add the product to cart from the detail page
    And they proceed toward checkout from the cart
    And they complete shipping fields and confirm mock payment
    Then the account profile should reflect the new order
