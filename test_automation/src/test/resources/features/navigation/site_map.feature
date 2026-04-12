@module_navigation
Feature: Global navigation mesh

  Scenario: Products link reaches catalog chrome
    Given the shopper landed from any page on the home route
    When they use the main menu to open products
    Then the catalog chrome should be visible

  Scenario: Cart link is wired from the header
    Given the shopper landed from any page on the home route
    When they jump to cart from the header
    Then the guest cart experience should prompt for authentication

  Scenario: Brand logo returns shoppers home
    When they return home through the brand logo
    Then the marketing hero should render again

  Scenario: Authenticated users reach profile from nav
    Given an authenticated shopper is browsing products
    When they open profile from the top navigation
    Then the membership profile heading should appear

  Scenario: Registration CTA is exposed in the header
    Given the shopper landed from any page on the home route
    When they choose the sign up navigation item
    Then the registration marketing form should display
