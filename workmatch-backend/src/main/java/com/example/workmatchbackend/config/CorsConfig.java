package com.example.workmatchbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Autorise toutes les routes
                        .allowedOrigins("*") // Autorise tous les domaines
                        .allowedMethods("*")  // Autorise tous les types de requêtes (GET, POST, PUT, DELETE, etc.)
                        .allowedHeaders("*")  // Autorise tous les headers
                        .allowCredentials(false); // On désactive les credentials pour éviter le conflit avec "*"
            }
        };
    }
}
