package com.mosscart.hooks;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoggingHooks {

  private static final Logger log = LoggerFactory.getLogger(LoggingHooks.class);

  @Before(order = 1)
  public void logScenarioStart(Scenario scenario) {
    log.info("Scenario start: {} [{}]", scenario.getName(), scenario.getUri());
  }

  @After(order = 99)
  public void logScenarioEnd(Scenario scenario) {
    if (scenario.isFailed()) {
      log.warn("Scenario FAILED: {}", scenario.getName());
    } else {
      log.info("Scenario passed: {}", scenario.getName());
    }
  }
}
