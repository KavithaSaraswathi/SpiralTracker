package com.spiraltrack.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${APP_CORS_ALLOWED_ORIGINS:}")
    private String configuredOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> allowedOrigins = new ArrayList<>(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://192.168.*.*:*",
                "http://10.*.*.*:*",
                "http://172.16.*.*:*"
        ));
        Arrays.stream(configuredOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .map(origin -> origin.startsWith("http://") || origin.startsWith("https://")
                        ? origin
                        : "https://" + origin)
                .forEach(allowedOrigins::add);

        registry.addMapping("/api/**")
                .allowedOriginPatterns(allowedOrigins.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
