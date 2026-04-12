@module_sustainability
Feature: Green Index surfaces

  Scenario: Catalog grid prints eco scores on cards
    When they inspect eco labels on the catalog grid
    Then each visible card should expose a Green Index score

  Scenario: PDP reinforces the eco narrative
    When they open any stocked product from the eco-heavy Moss category
    Then the detail sheet should highlight the Green Index

  Scenario: Marketing home references sustainability story
    Given the shopper navigates to the home page
    Then the home page sustainability blurb should mention the Green Index

  Scenario: Five-star filter keeps eco metadata visible
    When they tighten filters to only five-star eco listings
    Then every remaining card should still print an eco score row

  Scenario: Eco-heavy Moss category includes multiple scores
    When they filter the catalog by category "Moss"
    Then at least one product card should appear in the grid

  Scenario: Supplies aisle still shows eco row
    When they filter the catalog by category "Supplies"
    Then each visible card should expose a Green Index score
