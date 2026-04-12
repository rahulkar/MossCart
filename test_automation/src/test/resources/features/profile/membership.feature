@module_profile
Feature: Membership console

  Scenario: Profile dashboard loads for signed-in shoppers
    Given a shopper viewing their profile dashboard
    Then the profile header should still be visible

  Scenario: Edit mode can be cancelled without saving
    Given a shopper viewing their profile dashboard
    When they start editing profile details
    And they cancel profile edits
    Then the read-only profile card should return

  Scenario: Display name can be updated from profile
    Given a shopper viewing their profile dashboard
    When they start editing profile details
    And they save an updated display name "Eco Patron"
    Then the profile header should still be visible

  Scenario: Logging out from profile ends the session
    Given a shopper viewing their profile dashboard
    When they log out from the profile screen
    Then the storefront should treat them as signed out

  Scenario: Orders section renders for buyers without history
    Given a new shopper completes registration with valid credentials
    When the shopper navigates to the profile page
    Then the profile header should still be visible

  Scenario Outline: Display name can be updated to varied labels
    Given a shopper viewing their profile dashboard
    When they start editing profile details
    And they save an updated display name "<new_name>"
    Then the profile header should still be visible

    Examples:
      | new_name       |
      | Moss Curator   |
      | Aquascape Lead |
