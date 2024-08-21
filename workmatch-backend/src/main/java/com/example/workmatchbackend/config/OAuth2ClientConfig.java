package com.example.workmatchbackend.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class OAuth2ClientConfig {

    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }

    @Bean
    public ReactiveClientRegistrationRepository myClientRegistrationRepository() {
        // Configuration de votre client OAuth2
        ClientRegistration indeedClientRegistration = ClientRegistrations
                .fromIssuerLocation("https://secure.indeed.com")
                .clientId("votre-client-id")
                .clientSecret("votre-client-secret")
                .scope("read")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://localhost:8080/callback")
                .build();

        return new InMemoryReactiveClientRegistrationRepository(indeedClientRegistration);
    }
}

