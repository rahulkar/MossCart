@module_profile
Feature: Profile email editing and validation

  Background:
    Given a shopper viewing their profile dashboard

  Scenario: Profile displays current email address
    Then the profile email display should contain "@"

  Scenario: Profile edit form exposes email input
    When they start editing profile details
    Then the profile email input should be visible

  Scenario: Invalid email format is rejected by the browser
    When they start editing profile details
    And they enter an invalid email "not-an-email"
    Then the profile email input should report a validation error

  Scenario: Profile update persists a valid new email
    When they start editing profile details
    And they enter a valid new email
    And they save the profile changes
    Then the profile email display should contain the new email
