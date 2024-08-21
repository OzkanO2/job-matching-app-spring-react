package com.example.workmatchbackend.service;

import com.example.workmatchbackend.repository.CompanyRepository;
import com.example.workmatchbackend.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class IndeedJobService {

    private final WebClient webClient;

    @Autowired
    public IndeedJobService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Mono<String> getJobs() {
        return this.webClient
                .get()
                .uri("https://api.indeed.com/v2/jobsearch")
                .retrieve()
                .bodyToMono(String.class);
    }

    public void fetchAndStoreJobs() {
        // Logique pour appeler l'API d'Indeed, traiter les données et les stocker dans la DB
    }
}
