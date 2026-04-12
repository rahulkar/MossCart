@module_checkout @regression
Feature: Checkout and mock settlement

  Scenario: Mock payment captures shipping and lands on profile
    Given a shopper ready for checkout with one item in cart
    When they complete shipping fields and confirm mock payment
    Then the account profile should reflect the new order

  Scenario: Checkout warns when basket has zero lines
    When a signed-in shopper opens checkout with an empty basket
    Then checkout should advise that the cart has no items

  Scenario: HTML5 validation blocks empty shipping fields
    Given a shopper is on checkout with merchandise in the basket
    When they try paying after clearing all shipping inputs
    Then the browser should keep focus on the checkout experience

  Scenario: Happy path can be repeated for regression smoke
    Given a shopper ready for checkout with one item in cart
    When they complete shipping fields and confirm mock payment
    Then the account profile should reflect the new order

  Scenario: Cart hand-off exposes checkout heading
    Given a shopper ready for checkout with one item in cart
    When they proceed toward checkout from the cart
    Then the browser should keep focus on the checkout experience

  Scenario: Hardscape checkout completes mock capture
    Given a shopper ready for checkout with lava rock in cart
    When they run through mock settlement once
    Then the account profile should reflect the new order

  Scenario: Second purchase adds another order row
    Given a shopper ready for checkout with lava rock in cart
    When they run through mock settlement once
    And they navigate to the product catalog
    And they open the first product after searching for "Root Fertilizer"
    And they add the product to cart from the detail page
    And they proceed toward checkout from the cart
    And they complete shipping fields and confirm mock payment
    Then the account profile should reflect the new order

  Scenario: Simulated card decline keeps checkout open and preserves the cart
    Given a shopper ready for checkout with one item in cart
    And checkout will simulate a declined card authorization
    When they complete shipping fields and confirm mock payment
    Then they should remain on checkout with an error message
    And the cart should still hold the merchandise after the decline
    And the profile order history should show the failed payment attempt

  Scenario Outline: Diverse catalog picks complete mock settlement
    Given a shopper ready for checkout with product from search "<sku_query>"
    When they run through mock settlement once
    Then the account profile should reflect the new order

    Examples:
      | sku_query        |
      | Lava Rock        |
      | Super Glue       |
      | Christmas Moss   |
