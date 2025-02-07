package com.example.workmatchbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // 🔥 Assure-toi que c'est bien "/ws"
                .setAllowedOrigins("http://localhost:8081") // 🔥 Assure que c'est ton frontend
                .withSockJS();
    }


    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic"); // ✅ Tous les messages sont envoyés vers "/topic"
        registry.setApplicationDestinationPrefixes("/app"); // ✅ Les messages envoyés par le frontend doivent commencer par "/app"
    }
}
