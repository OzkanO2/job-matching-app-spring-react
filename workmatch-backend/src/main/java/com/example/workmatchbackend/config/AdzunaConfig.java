package com.example.workmatchbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AdzunaConfig {

    @Bean(name = "adzunaRestTemplate")
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
