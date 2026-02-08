package com.cgdim.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS est géré dans SecurityConfig (corsConfigurationSource) pour /api/**
}
