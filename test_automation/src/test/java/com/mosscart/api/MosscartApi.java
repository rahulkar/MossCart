package com.mosscart.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mosscart.support.TestConfig;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class MosscartApi {

  private static final Logger log = LoggerFactory.getLogger(MosscartApi.class);

  private final HttpClient http =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();
  private final ObjectMapper mapper = new ObjectMapper();
  private final String base;

  public MosscartApi() {
    this.base = TestConfig.apiBaseUrl();
  }

  public AuthResult register(String name, String email, String password) {
    ObjectNode n = mapper.createObjectNode();
    n.put("name", name);
    n.put("email", email);
    n.put("password", password);
    String json = postJson("/api/auth/register", write(n), null);
    return parseAuth(json);
  }

  public AuthResult login(String email, String password) {
    ObjectNode n = mapper.createObjectNode();
    n.put("email", email);
    n.put("password", password);
    String json = postJson("/api/auth/login", write(n), null);
    return parseAuth(json);
  }

  public List<ProductRef> listProducts(String query) {
    String path = "/api/products";
    if (query != null && !query.isBlank()) {
      path += "?q=" + URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
    }
    String json = get(path, null);
    return parseProductList(json);
  }

  public List<ProductRef> listProducts(String category, String ecoMin) {
    String path = "/api/products";
    List<String> params = new ArrayList<>();
    if (category != null && !category.isBlank()) {
      params.add("category=" + URLEncoder.encode(category.trim(), StandardCharsets.UTF_8));
    }
    if (ecoMin != null && !ecoMin.isBlank()) {
      params.add("ecoMin=" + URLEncoder.encode(ecoMin.trim(), StandardCharsets.UTF_8));
    }
    if (!params.isEmpty()) {
      path += "?" + String.join("&", params);
    }
    String json = get(path, null);
    return parseProductList(json);
  }

  private List<ProductRef> parseProductList(String json) {
    JsonNode root = readTree(json);
    JsonNode arr = root.isArray() ? root : root.path("products");
    if (!arr.isArray()) {
      throw new ApiException(500, "Expected product array");
    }
    List<ProductRef> out = new ArrayList<>();
    for (JsonNode n : arr) {
      out.add(
          new ProductRef(
              n.path("id").asText(null),
              n.path("name").asText(""),
              n.path("priceCents").asInt(0),
              n.path("stock").asInt(0)));
    }
    return out;
  }

  public List<String> listCategories() {
    String json = get("/api/products/categories", null);
    JsonNode arr = readTree(json);
    if (!arr.isArray()) {
      throw new ApiException(500, "Expected category array");
    }
    List<String> out = new ArrayList<>();
    for (JsonNode n : arr) {
      out.add(n.asText(""));
    }
    return out;
  }

  public ProductRef firstInStock(List<ProductRef> products) {
    return products.stream().filter(p -> p.stock() > 0).findFirst().orElseThrow(
        () -> new IllegalStateException("No in-stock product in list"));
  }

  public ProductRef findByNameContaining(List<ProductRef> products, String substring) {
    String s = substring.toLowerCase();
    return products.stream()
        .filter(p -> p.name().toLowerCase().contains(s))
        .findFirst()
        .orElseThrow(() -> new IllegalStateException("No product matching: " + substring));
  }

  public void addToCart(String token, String productId, int quantity) {
    ObjectNode n = mapper.createObjectNode();
    n.put("productId", productId);
    n.put("quantity", quantity);
    postJson("/api/cart/items", write(n), token);
  }

  public JsonNode getCart(String token) {
    String json = get("/api/cart", token);
    return readTree(json);
  }

  public JsonNode updateCartItem(String token, String itemId, int quantity) {
    ObjectNode n = mapper.createObjectNode();
    n.put("quantity", quantity);
    String json = patchJson("/api/cart/items/" + itemId, write(n), token);
    return readTree(json);
  }

  public void deleteCartItem(String token, String itemId) {
    delete("/api/cart/items/" + itemId, token);
  }

  public JsonNode getMe(String token) {
    String json = get("/api/auth/me", token);
    return readTree(json);
  }

  public JsonNode getUsersMe(String token) {
    String json = get("/api/users/me", token);
    return readTree(json);
  }

  public JsonNode updateProfile(String token, String name, String email) {
    ObjectNode n = mapper.createObjectNode();
    if (name != null) n.put("name", name);
    if (email != null) n.put("email", email);
    String json = putJson("/api/users/me", write(n), token);
    return readTree(json);
  }

  /** POST checkout; returns parsed order JSON node (includes id, totalCents, paymentStatus). */
  public JsonNode checkout(
      String token,
      String shippingName,
      String line1,
      String city,
      String postal,
      boolean simulateFailure) {
    ObjectNode n = mapper.createObjectNode();
    n.put("shippingName", shippingName);
    n.put("shippingLine1", line1);
    n.put("shippingCity", city);
    n.put("shippingPostal", postal);
    String path = simulateFailure ? "/api/checkout?fail=true" : "/api/checkout";
    String json = postJson(path, write(n), token);
    return readTree(json);
  }

  private AuthResult parseAuth(String json) {
    JsonNode root = readTree(json);
    String token = root.path("token").asText(null);
    JsonNode user = root.path("user");
    String id = user.path("id").asText(null);
    String email = user.path("email").asText(null);
    String name = user.path("name").asText(null);
    if (token == null || id == null) {
      throw new ApiException(500, "Malformed auth response: " + json);
    }
    return new AuthResult(id, email, name, token);
  }

  private JsonNode readTree(String json) {
    try {
      return mapper.readTree(json);
    } catch (IOException e) {
      throw new ApiException(500, "Invalid JSON: " + e.getMessage());
    }
  }

  private String get(String path, String bearer) {
    try {
      HttpRequest.Builder b =
          HttpRequest.newBuilder()
              .uri(URI.create(base + path))
              .timeout(Duration.ofSeconds(30))
              .GET();
      if (bearer != null && !bearer.isBlank()) {
        b.header("Authorization", "Bearer " + bearer);
      }
      return send(b.build());
    } catch (IOException | InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new ApiException(0, e.getMessage());
    }
  }

  private String postJson(String path, String jsonBody, String bearer) {
    return writeRequest("POST", path, jsonBody, bearer);
  }

  private String putJson(String path, String jsonBody, String bearer) {
    return writeRequest("PUT", path, jsonBody, bearer);
  }

  private String patchJson(String path, String jsonBody, String bearer) {
    return writeRequest("PATCH", path, jsonBody, bearer);
  }

  private void delete(String path, String bearer) {
    try {
      HttpRequest.Builder b =
          HttpRequest.newBuilder()
              .uri(URI.create(base + path))
              .timeout(Duration.ofSeconds(30))
              .DELETE();
      if (bearer != null && !bearer.isBlank()) {
        b.header("Authorization", "Bearer " + bearer);
      }
      send(b.build());
    } catch (IOException | InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new ApiException(0, e.getMessage());
    }
  }

  private String writeRequest(String method, String path, String jsonBody, String bearer) {
    try {
      HttpRequest.Builder b =
          HttpRequest.newBuilder()
              .uri(URI.create(base + path))
              .timeout(Duration.ofSeconds(30))
              .header("Content-Type", "application/json");
      HttpRequest.BodyPublisher body =
          jsonBody == null
              ? HttpRequest.BodyPublishers.noBody()
              : HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8);
      b = b.method(method, body);
      if (bearer != null && !bearer.isBlank()) {
        b.header("Authorization", "Bearer " + bearer);
      }
      return send(b.build());
    } catch (IOException | InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new ApiException(0, e.getMessage());
    }
  }

  private String send(HttpRequest req) throws IOException, InterruptedException {
    log.debug("{} {}", req.method(), req.uri());
    HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
    String body = res.body() == null ? "" : res.body();
    if (res.statusCode() >= 200 && res.statusCode() < 300) {
      return body;
    }
    log.warn("API error {}: {}", res.statusCode(), body);
    throw new ApiException(res.statusCode(), body);
  }

  public ApiResponse sendExpectingStatus(String method, String path, String jsonBody, String bearer) {
    try {
      HttpRequest.Builder b =
          HttpRequest.newBuilder()
              .uri(URI.create(base + path))
              .timeout(Duration.ofSeconds(30));
      if (jsonBody != null) {
        b.header("Content-Type", "application/json")
            .method(method, HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8));
      } else {
        b.method(method, HttpRequest.BodyPublishers.noBody());
      }
      if (bearer != null && !bearer.isBlank()) {
        b.header("Authorization", "Bearer " + bearer);
      }
      HttpResponse<String> res = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
      return new ApiResponse(res.statusCode(), res.body() == null ? "" : res.body());
    } catch (IOException | InterruptedException e) {
      Thread.currentThread().interrupt();
      return new ApiResponse(0, e.getMessage());
    }
  }

  private String write(ObjectNode n) {
    try {
      return mapper.writeValueAsString(n);
    } catch (IOException e) {
      throw new ApiException(500, e.getMessage());
    }
  }
}
