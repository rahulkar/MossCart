@module_orders
Feature: Order metadata and missing order handling

  Background:
    Given a shopper who already completed a purchase

  Scenario: Order receipt displays status and date metadata
    When they open the first receipt link from profile history
    Then the order receipt should show status and date metadata

  Scenario: Non-existent order shows a not found message
    When they open an invalid order route directly
    Then the order not found placeholder should display
