@module_cart
Feature: Cart financial calculations

  Background:
    Given a signed-in shopper with an empty cart

  Scenario: Cart line subtotal equals unit price multiplied by quantity
    When they add the product from search "Java Moss Portion" to the cart from the PDP
    And they set the first cart line quantity to 3
    Then the first cart line subtotal in cents should be 3897

  Scenario: Cart total equals the sum of line subtotals
    When they add the product from search "Java Moss Portion" to the cart from the PDP
    And they add a second SKU from search "Christmas Moss"
    Then the cart total should equal the sum of visible line subtotals
