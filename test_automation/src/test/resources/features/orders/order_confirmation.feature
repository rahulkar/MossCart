@module_orders @regression
Feature: Order confirmation page

  Scenario: Successful checkout lands on order confirmation
    Given a shopper ready for checkout with one item in cart
    When they complete shipping fields and confirm mock payment
    Then the order confirmation page should display
    And the order confirmation should show shipping details

  Scenario: Shopper can navigate to profile from order confirmation
    Given a shopper ready for checkout with one item in cart
    When they complete shipping fields and confirm mock payment
    And they proceed to their profile from the order confirmation
    Then the account profile should reflect the new order
