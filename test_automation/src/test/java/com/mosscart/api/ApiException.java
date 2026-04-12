package com.mosscart.api;

public final class ApiException extends RuntimeException {

  private final int statusCode;

  public ApiException(int statusCode, String message) {
    super("HTTP " + statusCode + ": " + message);
    this.statusCode = statusCode;
  }

  public int statusCode() {
    return statusCode;
  }
}
