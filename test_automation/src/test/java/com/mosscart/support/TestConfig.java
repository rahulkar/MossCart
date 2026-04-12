package com.mosscart.support;

import java.time.Duration;

public final class TestConfig {

  private static final String DEFAULT_BASE = "http://localhost:8080";

  private TestConfig() {}

  public static String baseUrl() {
    String env = System.getenv("BASE_URL");
    if (env != null && !env.isBlank()) {
      return env.replaceAll("/$", "");
    }
    String prop = System.getProperty("baseUrl");
    if (prop != null && !prop.isBlank()) {
      return prop.replaceAll("/$", "");
    }
    return DEFAULT_BASE;
  }

  /** Origin for REST calls (same as storefront unless API_BASE_URL is set). */
  public static String apiBaseUrl() {
    String env = System.getenv("API_BASE_URL");
    if (env != null && !env.isBlank()) {
      return env.replaceAll("/$", "");
    }
    String prop = System.getProperty("api.base.url");
    if (prop != null && !prop.isBlank()) {
      return prop.replaceAll("/$", "");
    }
    return baseUrl();
  }

  public static String seleniumRemoteUrl() {
    String env = System.getenv("SELENIUM_REMOTE_URL");
    if (env != null && !env.isBlank()) {
      return env.trim();
    }
    String prop = System.getProperty("selenium.remote.url");
    return prop != null && !prop.isBlank() ? prop.trim() : null;
  }

  /** Browser name: chrome (default) or firefox. */
  public static String browser() {
    String env = System.getenv("BROWSER");
    if (env != null && !env.isBlank()) {
      return env.trim().toLowerCase();
    }
    String prop = System.getProperty("browser");
    return prop != null && !prop.isBlank() ? prop.trim().toLowerCase() : "chrome";
  }

  public static boolean headless() {
    String env = System.getenv("HEADLESS");
    if (env != null && !env.isBlank()) {
      return "1".equals(env) || "true".equalsIgnoreCase(env.trim());
    }
    String prop = System.getProperty("headless");
    return prop != null && ("1".equals(prop) || "true".equalsIgnoreCase(prop));
  }

  public static Duration defaultWaitTimeout() {
    return Duration.ofSeconds(readInt("WAIT_TIMEOUT_SEC", "wait.timeout.sec", 20));
  }

  public static Duration shortWaitTimeout() {
    return Duration.ofSeconds(readInt("SHORT_WAIT_TIMEOUT_SEC", "short.wait.timeout.sec", 5));
  }

  public static Duration pageLoadTimeout() {
    return Duration.ofSeconds(readInt("PAGE_LOAD_TIMEOUT_SEC", "page.load.timeout.sec", 45));
  }

  public static Duration scriptTimeout() {
    return Duration.ofSeconds(readInt("SCRIPT_TIMEOUT_SEC", "script.timeout.sec", 30));
  }

  public static Duration waitPollInterval() {
    return Duration.ofMillis(readInt("WAIT_POLL_MS", "wait.poll.ms", 200));
  }

  /** Optional window size for headless/CI: WIDTHxHEIGHT e.g. 1920x1080 */
  public static int[] windowSizeOrNull() {
    String raw = firstNonBlank(System.getenv("WINDOW_SIZE"), System.getProperty("window.size"));
    if (raw == null || raw.isBlank()) {
      return null;
    }
    String[] parts = raw.trim().toLowerCase().split("[xX]");
    if (parts.length != 2) {
      return null;
    }
    try {
      return new int[] {Integer.parseInt(parts[0].trim()), Integer.parseInt(parts[1].trim())};
    } catch (NumberFormatException e) {
      return null;
    }
  }

  private static int readInt(String envKey, String propKey, int defaultVal) {
    String env = System.getenv(envKey);
    if (env != null && !env.isBlank()) {
      try {
        return Integer.parseInt(env.trim());
      } catch (NumberFormatException ignored) {
        return defaultVal;
      }
    }
    String prop = System.getProperty(propKey);
    if (prop != null && !prop.isBlank()) {
      try {
        return Integer.parseInt(prop.trim());
      } catch (NumberFormatException ignored) {
        return defaultVal;
      }
    }
    return defaultVal;
  }

  private static String firstNonBlank(String a, String b) {
    if (a != null && !a.isBlank()) {
      return a;
    }
    if (b != null && !b.isBlank()) {
      return b;
    }
    return null;
  }
}
