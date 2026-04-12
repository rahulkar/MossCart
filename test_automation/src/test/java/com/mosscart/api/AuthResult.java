package com.mosscart.api;

public record AuthResult(String userId, String email, String name, String token) {}
