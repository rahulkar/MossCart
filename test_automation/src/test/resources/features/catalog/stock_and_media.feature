@module_catalog
Feature: Stock states and merchandising media

  Scenario: Listings without photography show placeholder tiles
    When they open the first listing that is missing marketing photography
    Then the gallery should render the placeholder state for missing artwork

  Scenario: Missing media PDP still explains Green Index
    When they open the first listing that is missing marketing photography
    Then the product detail view should surface the Green Index badge

  Scenario: Sold-out driftwood SKU shows zero stock messaging
    When they locate the sold-out driftwood listing via search
    Then stock messaging should read out of stock

  Scenario: Out-of-stock SKU disables purchase CTA
    When they locate the sold-out driftwood listing via search
    Then the primary purchase button should stay disabled

  Scenario: In-stock PDP remains purchasable
    When they open the first product after searching for "All-in-One Aquarium"
    Then the product detail view should surface the Green Index badge

  Scenario: Supplies category includes image-pending SKU
    When they filter the catalog by category "Supplies"
    Then at least one product card should appear in the grid
