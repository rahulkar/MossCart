@module_catalog
Feature: Catalog discovery and filters

  Scenario: Default catalog shows multiple SKUs
    Given the shopper navigates to the product catalog
    Then multiple product cards should be visible simultaneously

  Scenario: Rocks aisle filter narrows the grid
    When they filter the catalog by category "Rocks"
    Then at least one product card should appear in the grid

  Scenario: Moss filter surfaces live moss inventory
    When they filter the catalog by category "Moss"
    Then at least one product card should appear in the grid

  Scenario: Search finds java moss merchandise
    When they search the catalog for text "Java Moss"
    Then at least one product card should appear in the grid

  Scenario: Nonsense search yields empty state
    When they search the catalog for text "zzzz-no-sku-zzzz"
    Then the catalog should report no matching products

  Scenario: Eco filter highlights greener catalog rows
    When they set the eco filter to four or higher
    Then at least one product card should appear in the grid

  Scenario: Strict five-star eco filter still returns hits
    When they set the eco filter to only five-star listings
    Then at least one product card should appear in the grid

  Scenario: Clearing eco filter widens the assortment again
    When they set the eco filter to only five-star listings
    And they clear eco filters back to any score
    Then multiple product cards should be visible simultaneously

  Scenario: PDP exposes taxonomy from grid selection
    When they drill into the first catalog card
    Then the product detail view should surface the Green Index badge

  Scenario: Category plus search can be combined via UI flow
    When they keep the "Supplies" category selected and search for "Gel"
    Then at least one product card should appear in the grid

  Rule: Matrix examples document how category, search, and eco filters interact

    Scenario Outline: Category and search matrix yields a predictable grid state
      When they browse the catalog with category "<category>" and search text "<search>"
      Then the catalog grid expectation is "<expectation>"

      Examples:
        | category | search             | expectation |
        | Rocks    |                    | non_empty   |
        | Moss     | Phoenix            | non_empty   |
        | Moss     | zzzz-no-sku-zzzz   | empty       |
        | All      | Java Moss          | non_empty   |
        | Supplies | zzzz-empty-zzzz    | empty       |

    Scenario Outline: Eco and category together narrow moss inventory
      When they browse the catalog with category "<category>" and eco minimum score "<eco_min>"
      Then the catalog grid expectation is "non_empty"

      Examples:
        | category | eco_min |
        | Moss     | 5       |
        | Moss     | 4       |
