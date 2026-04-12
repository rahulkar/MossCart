@module_auth
Feature: Credential lifecycle

  Scenario: Happy-path registration establishes a session
    Given a new shopper completes registration with valid credentials
    Then the authenticated profile link should be visible in the header

  Scenario: Sign-out returns the public navigation affordances
    Given a new shopper completes registration with valid credentials
    When the shopper signs out from the navigation bar
    Then the public login entry point should be visible

  Scenario: Returning shoppers can authenticate with stored secrets
    Given a new shopper completes registration with valid credentials
    When the shopper signs out from the navigation bar
    And the shopper signs in using the saved email and password
    Then the authenticated profile link should be visible in the header

  Scenario: Duplicate email registrations are rejected
    When they submit registration with a duplicate email
    Then an email conflict message should be displayed

  Scenario: Wrong password surfaces login errors
    When they attempt login with a wrong password
    Then the login form should show an authentication error

  Scenario: Login page resets for another attempt
    When they attempt login with a wrong password
    And they open the login screen again after a failed attempt
    Then the login surface should be ready for input
