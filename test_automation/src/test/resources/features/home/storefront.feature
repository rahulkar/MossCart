@module_home @smoke
Feature: Storefront home experience

  Scenario: Hero headline anchors the landing story
    Given the shopper navigates to the home page
    Then the storefront hero headline should be visible

  Scenario: Marketing hero band renders full-width
    Given the shopper navigates to the home page
    Then the hero marketing band should be rendered

  Scenario: Sustainability copy introduces the Green Index
    Given the shopper navigates to the home page
    Then the Green Index pitch should appear on the home page

  Scenario: Value props explain why the demo shop exists
    Given the shopper navigates to the home page
    Then the value proposition cards should be listed

  Scenario: Featured rail showcases inventory snapshots
    Given the shopper navigates to the home page
    Then the featured product grid should be visible

  Scenario: Primary CTA hands off to the catalog
    When the shopper uses the primary shop call-to-action
    Then the product catalog page should load

  Scenario: Featured cards deep-link into PDP
    When the shopper selects the first featured product from home
    Then the product detail layout should appear
