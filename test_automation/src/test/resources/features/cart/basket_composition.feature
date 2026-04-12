@module_cart
Feature: Basket composition for signed-in shoppers

  A shared authenticated empty cart reduces repetition for line-item scenarios.

  Background:
    Given a signed-in shopper with an empty cart

  Scenario: Signed-in shopper adds catalog merchandise
    When they add the first in-stock catalog item to the cart
    Then the cart should list line items with totals

  Scenario: Line removal empties the basket again
    When they add the first in-stock catalog item to the cart
    And they remove the first line from the shopping cart
    Then the empty cart placeholder should display

  Scenario: Header cart shortcut preserves basket contents
    When they add the first in-stock catalog item to the cart
    And they revisit the cart from the header after browsing home
    Then the cart should still contain merchandise

  Scenario: Multiple PDP adds accumulate in the basket
    When they add the first in-stock catalog item to the cart
    And they add a second SKU from search "Christmas Moss"
    Then the cart summary should show a non-zero total

  Scenario Outline: Cart quantity updates recalculate the basket total
    When they add the product from search "Java Moss Portion" to the cart from the PDP
    And they set the first cart line quantity to <qty>
    Then the cart total in cents should be <total_cents>

    Examples:
      | qty | total_cents |
      | 1   | 1299        |
      | 2   | 2598        |
      | 3   | 3897        |

  Scenario: Duplicate PDP adds respect single-unit promotional stock
    When they open the first product after searching for "Promotional Moss Sample"
    And they add the product to cart from the detail page twice in succession
    Then the first cart line should show quantity 1

  Scenario: Cart line table reflects a multi-SKU basket
    When they add the product from search "Java Moss Portion" to the cart from the PDP
    And they add a second SKU from search "Christmas Moss"
    Then the cart should include these lines:
      | product_contains | quantity |
      | Java Moss        | 1        |
      | Christmas        | 1        |
