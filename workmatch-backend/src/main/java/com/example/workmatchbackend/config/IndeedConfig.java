package com.example.workmatchbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class IndeedConfig {

    @Bean(name = "indeedWebClient")
    public WebClient indeedWebClient() {
        return WebClient.builder()
                .baseUrl("https://api.indeed.com")
                .build();
    }
}
