package com.mosscart.support;

import com.mosscart.api.AuthResult;
import java.util.UUID;

public final class ScenarioContext {

  private static final ThreadLocal<String> EMAIL = new ThreadLocal<>();
  private static final ThreadLocal<String> PASSWORD = new ThreadLocal<>();
  private static final ThreadLocal<String> NAME = new ThreadLocal<>();
  private static final ThreadLocal<String> TOKEN = new ThreadLocal<>();
  private static final ThreadLocal<String> USER_ID = new ThreadLocal<>();
  private static final ThreadLocal<String> LAST_ORDER_ID = new ThreadLocal<>();
  private static final ThreadLocal<Integer> EXPECTED_TOTAL_CENTS = new ThreadLocal<>();
  private static final ThreadLocal<Boolean> SIMULATE_PAYMENT_FAILURE = new ThreadLocal<>();
  private static final ThreadLocal<String> NEW_EMAIL = new ThreadLocal<>();

  private ScenarioContext() {}

  public static void setCredentials(String name, String email, String password) {
    NAME.set(name);
    EMAIL.set(email);
    PASSWORD.set(password);
  }

  public static void applyAuthResult(AuthResult session, String password) {
    NAME.set(session.name());
    EMAIL.set(session.email());
    PASSWORD.set(password);
    TOKEN.set(session.token());
    USER_ID.set(session.userId());
  }

  public static void setToken(String token) {
    TOKEN.set(token);
  }

  public static void setUserId(String userId) {
    USER_ID.set(userId);
  }

  public static void setLastOrderId(String id) {
    LAST_ORDER_ID.set(id);
  }

  public static void setExpectedTotalCents(int cents) {
    EXPECTED_TOTAL_CENTS.set(cents);
  }

  public static void setSimulatePaymentFailure(boolean v) {
    SIMULATE_PAYMENT_FAILURE.set(v);
  }

  public static void setNewEmail(String email) {
    NEW_EMAIL.set(email);
  }

  public static boolean simulatePaymentFailure() {
    Boolean b = SIMULATE_PAYMENT_FAILURE.get();
    return b != null && b;
  }

  public static String getEmail() {
    return EMAIL.get();
  }

  public static String getPassword() {
    return PASSWORD.get();
  }

  public static String getName() {
    return NAME.get();
  }

  public static String getToken() {
    return TOKEN.get();
  }

  public static String getUserId() {
    return USER_ID.get();
  }

  public static String getLastOrderId() {
    return LAST_ORDER_ID.get();
  }

  public static Integer getExpectedTotalCents() {
    return EXPECTED_TOTAL_CENTS.get();
  }

  public static String getNewEmail() {
    return NEW_EMAIL.get();
  }

  public static String uniqueEmail(String prefix) {
    return prefix + UUID.randomUUID().toString().replace("-", "") + "@test.local";
  }

  public static void clear() {
    EMAIL.remove();
    PASSWORD.remove();
    NAME.remove();
    TOKEN.remove();
    USER_ID.remove();
    LAST_ORDER_ID.remove();
    EXPECTED_TOTAL_CENTS.remove();
    SIMULATE_PAYMENT_FAILURE.remove();
    NEW_EMAIL.remove();
  }
}
