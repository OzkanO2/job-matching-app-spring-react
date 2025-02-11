package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobOfferAdzuna;
import com.example.workmatchbackend.repository.JobOfferAdzunaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdzunaImportService {

    @Autowired
    private JobOfferAdzunaRepository jobOfferAdzunaRepository;

    private static final Logger logger = LoggerFactory.getLogger(AdzunaImportService.class);

    private final String APP_ID = "b50d337a";
    private final String APP_KEY = "7a9d8272a034e629a9f62ae0adb917ba";
    private final String API_URL = "https://api.adzuna.com/v1/api/jobs/fr/search/1";

    public void fetchAndStoreITJobs() {
        String[] keywords = {"developer", "devops", "backend", "frontend", "fullstack", "java", "python", "react", "angular"};

        for (String keyword : keywords) {
            fetchJobsForKeyword(keyword);
        }
    }

    private void fetchJobsForKeyword(String keyword) {
        String url = API_URL + "?app_id=" + APP_ID + "&app_key=" + APP_KEY + "&what=" + keyword + "&results_per_page=10";

        logger.info("Fetching IT jobs from Adzuna for keyword: {}", keyword);

        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<JsonNode> response = restTemplate.getForEntity(url, JsonNode.class);
            JsonNode jobs = response.getBody().get("results");

            List<JobOfferAdzuna> newOffers = new ArrayList<>();

            for (JsonNode job : jobs) {
                String externalId = job.hasNonNull("id") ? job.get("id").asText() : null;

                if (externalId != null && jobOfferAdzunaRepository.existsByExternalId(externalId)) {
                    logger.info("Offre déjà existante: {}", job.get("title").asText());
                    continue;
                }

                JobOfferAdzuna jobOffer = new JobOfferAdzuna();
                jobOffer.setTitle(job.hasNonNull("title") ? job.get("title").asText() : "Title not available");
                jobOffer.setDescription(job.hasNonNull("description") ? job.get("description").asText() : "No description");
                jobOffer.setLocations(job.has("location") && job.get("location").hasNonNull("display_name")
                        ? List.of(job.get("location").get("display_name").asText())
                        : List.of("Unknown location"));
                jobOffer.setSalaryMin(job.hasNonNull("salary_min") ? job.get("salary_min").asDouble() : 0.0);
                jobOffer.setSalaryMax(job.hasNonNull("salary_max") ? job.get("salary_max").asDouble() : 0.0);
                jobOffer.setUrl(job.hasNonNull("redirect_url") ? job.get("redirect_url").asText() : "No URL");
                jobOffer.setApiSource("Adzuna");
                jobOffer.setExternalId(externalId);
                jobOffer.setCategory("IT");
                jobOffer.setEmploymentType(job.has("contract_time") ? job.get("contract_time").asText() : "Unknown");
                jobOffer.setCreatedAt(LocalDate.now());

                newOffers.add(jobOffer);
            }

            jobOfferAdzunaRepository.saveAll(newOffers);
            logger.info("{} nouvelles offres IT ajoutées.", newOffers.size());

        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des offres: {}", e.getMessage());
        }
    }
}
