@module_api
Feature: API contract and negative paths

  Scenario: Auth endpoints reject missing or invalid tokens
    When the API receives a "GET" request to "/api/auth/me" with no token
    Then the API response status should be 401
    When the API receives a "GET" request to "/api/auth/me" with an invalid token
    Then the API response status should be 401

  Scenario: User profile endpoints require authentication
    When the API receives a "GET" request to "/api/users/me" with no token
    Then the API response status should be 401
    When the API receives a "PUT" request to "/api/users/me" with body:
      """
      {"name":"X"}
      """
    Then the API response status should be 401

  Scenario: Cart endpoints require authentication
    When the API receives a "GET" request to "/api/cart" with no token
    Then the API response status should be 401
    When the API receives a "PATCH" request to "/api/cart/items/does-not-exist" with body:
      """
      {"quantity":2}
      """
    Then the API response status should be 401

  Scenario: Registration validates required fields
    When the API receives a "POST" request to "/api/auth/register" with body:
      """
      {"email":"a","password":"short"}
      """
    Then the API response status should be 400
    And the API response body should contain error code "validation_error"

  Scenario: Duplicate email returns conflict
    Given a fresh registered shopper via API
    When the API receives a "POST" request to "/api/auth/register" with body:
      """
      {"name":"Other","email":"REPLACE_EMAIL","password":"TestPass123"}
      """
    Then the API response status should be 409

  Scenario: Categories endpoint is public
    When the API receives a "GET" request to "/api/products/categories" with no token
    Then the API response status should be 200

  Scenario: Product query validates eco score range
    When the API receives a "GET" request to "/api/products?ecoMin=99" with no token
    Then the API response status should be 400

  Scenario: Profile update validates email format
    Given a fresh registered shopper via API
    When the API receives a "PUT" request to "/api/users/me" with body:
      """
      {"email":"not-an-email"}
      """
    Then the API response status should be 400
