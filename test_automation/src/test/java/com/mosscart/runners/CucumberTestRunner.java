package com.mosscart.runners;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(
    key = GLUE_PROPERTY_NAME,
    value =
        "com.mosscart.hooks,"
            + "com.mosscart.steps.common,"
            + "com.mosscart.steps.home,"
            + "com.mosscart.steps.auth,"
            + "com.mosscart.steps.catalog,"
            + "com.mosscart.steps.cart,"
            + "com.mosscart.steps.checkout,"
            + "com.mosscart.steps.profile,"
            + "com.mosscart.steps.navigation,"
            + "com.mosscart.steps.sustainability,"
            + "com.mosscart.steps.orders,"
            + "com.mosscart.steps.journeys,"
            + "com.mosscart.steps.api")
@ConfigurationParameter(
    key = PLUGIN_PROPERTY_NAME,
    value =
        "pretty, html:target/cucumber-report.html, "
            + "io.qameta.allure.cucumber7jvm.AllureCucumber7Jvm")
public class CucumberTestRunner {}
