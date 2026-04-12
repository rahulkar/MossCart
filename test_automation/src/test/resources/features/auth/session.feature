@module_auth
Feature: Session entry points

  Scenario: Registration screen is reachable from navigation
    Given the shopper navigates to the home page
    When they choose the sign up navigation item
    Then the registration marketing form should display

  Scenario: Login screen loads for anonymous visitors
    Given the shopper navigates to the login page
    Then the login surface should be ready for input

  Scenario: Catalog remains available before authenticating
    Given the shopper navigates to the product catalog
    Then at least one product card should appear in the grid

  Scenario: Cart prompts guests without a session cookie
    When an anonymous visitor opens the cart route directly
    Then the guest cart experience should prompt for authentication

  Scenario: Checkout rejects deep-links while signed out
    When an anonymous user deep-links to checkout
    Then checkout should ask the visitor to authenticate first

  Scenario: API-seeded session can open profile and sign out cleanly
    Given the shopper is registered via API and authenticated in the browser
    When they open the profile page from the navigation bar
    Then the membership profile heading should appear
    When the shopper signs out from the navigation bar
    Then the public login entry point should be visible
