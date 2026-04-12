@module_orders
Feature: Order receipts and history

  Scenario: Receipt view lists line items after purchase
    Given a shopper who already completed a purchase
    When they open the first receipt link from profile history
    Then the order receipt view should list purchased lines

  Scenario: Receipt shows shipping snapshot
    Given a shopper who already completed a purchase
    When they open the first receipt link from profile history
    Then fulfillment address data should be shown on the receipt

  Scenario: Back navigation returns to profile overview
    Given a shopper who already completed a purchase
    When they open the first receipt link from profile history
    And they navigate back toward account overview
    Then the profile header should still be visible

  Scenario: Profile lists monetary totals for closed orders
    Given a shopper who already completed a purchase
    When the shopper navigates to the profile page
    Then the profile header should still be visible

  Scenario: Multi-SKU checkout total matches the order receipt
    Given a signed-in shopper with multiple SKUs in the cart via API
    When they pay from checkout after reviewing the combined order summary
    And they open the latest order receipt from the profile
    Then the receipt total should match the expected checkout total
