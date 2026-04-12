package com.mosscart.support;

import com.mosscart.api.AuthResult;
import com.mosscart.api.MosscartApi;
import com.mosscart.api.ProductRef;
import java.util.List;

public final class ApiFixtures {

  private ApiFixtures() {}

  public static void registerAndInjectSession(String displayName, String emailPrefix) {
    String email = ScenarioContext.uniqueEmail(emailPrefix);
    String password = "TestPass123";
    MosscartApi api = new MosscartApi();
    AuthResult r = api.register(displayName, email, password);
    ScenarioContext.applyAuthResult(r, password);
    BrowserSession.injectAuthTokenAndRefreshHome(r.token());
  }

  public static void registerInjectWithOneInStockLine() {
    registerAndInjectSession("Checkout User", "co");
    MosscartApi api = new MosscartApi();
    List<ProductRef> all = api.listProducts(null);
    ProductRef p = api.firstInStock(all);
    api.addToCart(ScenarioContext.getToken(), p.id(), 1);
  }

  public static void registerInjectWithProductSearch(String displayName, String emailPrefix, String search) {
    registerAndInjectSession(displayName, emailPrefix);
    MosscartApi api = new MosscartApi();
    List<ProductRef> list = api.listProducts(search);
    ProductRef p = api.findByNameContaining(list, search);
    api.addToCart(ScenarioContext.getToken(), p.id(), 1);
  }

  public static ProductRef addToCartViaApiForCurrentUser(String searchQuery, int quantity) {
    MosscartApi api = new MosscartApi();
    List<ProductRef> list = api.listProducts(searchQuery);
    ProductRef p = api.findByNameContaining(list, searchQuery);
    api.addToCart(ScenarioContext.getToken(), p.id(), quantity);
    return p;
  }

  public static ProductRef firstInStockFromCatalog() {
    MosscartApi api = new MosscartApi();
    return api.firstInStock(api.listProducts(null));
  }
}
