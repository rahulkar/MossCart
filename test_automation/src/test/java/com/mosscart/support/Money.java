package com.mosscart.support;

import java.math.BigDecimal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class Money {

  private static final Pattern USD = Pattern.compile("\\$\\s*([0-9]+(?:\\.[0-9]{1,2})?)");

  private Money() {}

  public static int usdSnippetToCents(String text) {
    Matcher m = USD.matcher(text);
    if (!m.find()) {
      throw new IllegalArgumentException("No USD amount in: " + text);
    }
    return new BigDecimal(m.group(1)).movePointRight(2).intValue();
  }
}
