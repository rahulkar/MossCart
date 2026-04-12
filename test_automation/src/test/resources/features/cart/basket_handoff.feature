@module_cart
Feature: Cart to checkout hand-off

  Scenarios that need a pre-filled cart (not Background) live here.

  Scenario: Proceed to checkout requires line items
    Given a shopper ready for checkout with one item in cart
    When they proceed toward checkout from the cart
    Then the browser should keep focus on the checkout experience
