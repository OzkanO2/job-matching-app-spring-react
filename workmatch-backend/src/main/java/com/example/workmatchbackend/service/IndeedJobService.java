package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.web.reactive.function.client.ServerOAuth2AuthorizedClientExchangeFilterFunction;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class IndeedJobService {

    private final WebClient webClient;
    private final JobOfferRepository jobOfferRepository;

    @Autowired
    public IndeedJobService(WebClient webClient, JobOfferRepository jobOfferRepository) {
        this.webClient = webClient;
        this.jobOfferRepository = jobOfferRepository;
    }

    public List<JobOffer> fetchAndSaveJobOffers(String location) {
        List<JobOffer> jobOffers = this.webClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("https://api.indeed.com/v2/jobsearch")
                        .queryParam("q", "software developer") // Exemples de paramètres de requête
                        .queryParam("l", location)
                        .queryParam("limit", 1000) // Limite de 1000 résultats
                        .build())
                .retrieve()
                .bodyToMono(IndeedJobResponse.class)
                .map(IndeedJobResponse::getResults)
                .block();  // Convertir en liste synchrone

        if (jobOffers != null && !jobOffers.isEmpty()) {
            storeJobOffers(jobOffers);
        }

        return jobOffers;
    }
    public Mono<List<JobOffer>> fetchJobOffers(@RegisteredOAuth2AuthorizedClient("indeed") OAuth2AuthorizedClient authorizedClient, String location) {
        return this.webClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("https://api.indeed.com/v2/jobsearch")
                        .queryParam("q", "software developer")
                        .queryParam("l", location)
                        .build())
                .attributes(ServerOAuth2AuthorizedClientExchangeFilterFunction.oauth2AuthorizedClient(authorizedClient))
                .retrieve()
                .bodyToMono(IndeedJobResponse.class)
                .map(IndeedJobResponse::getResults)
                .doOnNext(this::storeJobOffers);
    }
    private void storeJobOffers(List<JobOffer> jobOffers) {
        // Enregistrer les offres d'emploi dans la base de données
        jobOfferRepository.saveAll(jobOffers);
    }

    // Classe interne pour représenter la réponse de l'API Indeed
    public static class IndeedJobResponse {
        private List<JobOffer> results;

        public List<JobOffer> getResults() {
            return results;
        }

        public void setResults(List<JobOffer> results) {
            this.results = results;
        }
    }
}
