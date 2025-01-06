package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import com.example.workmatchbackend.model.Company;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
@Service
public class AdzunaJobService {

    @Autowired
    private JobOfferRepository jobOfferRepository;
    private static final Logger logger = LoggerFactory.getLogger(AdzunaJobService.class);

    public List<JobOffer> fetchJobsFromAdzuna(String country, String what, int resultsPerPage) {
        String apiUrl = "https://api.adzuna.com/v1/api/jobs/" + country + "/search/1";
        apiUrl += "?app_id=b50d337a&app_key=7a9d8272a034e629a9f62ae0adb917ba";
        apiUrl += "&what=" + what + "&results_per_page=" + resultsPerPage;
        logger.info("Fetching jobs from Adzuna API for country: {} and domain: {}", country, what);

        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<JsonNode> response = restTemplate.getForEntity(apiUrl, JsonNode.class);
            logger.info("Received response from Adzuna API");
            JsonNode jobs = response.getBody().get("results");

            List<JobOffer> jobOffers = new ArrayList<>();
            for (JsonNode job : jobs) {
                JobOffer jobOffer = new JobOffer();

                // Vérification des données pour chaque champ avant de les affecter

                // Titre
                if (job.hasNonNull("title")) {
                    jobOffer.setTitle(job.get("title").asText());
                } else {
                    jobOffer.setTitle("Title not available");
                }

                // Description
                if (job.hasNonNull("description")) {
                    jobOffer.setDescription(job.get("description").asText());
                } else {
                    jobOffer.setDescription("Description not available");
                }

                // Localisation
                if (job.has("location") && job.get("location").hasNonNull("display_name")) {
                    jobOffer.setLocation(job.get("location").get("display_name").asText());
                } else {
                    jobOffer.setLocation("Location not available");
                }

                // Salaire minimum
                if (job.hasNonNull("salary_min")) {
                    jobOffer.setSalaryMin(job.get("salary_min").asDouble());
                }

                // Salaire maximum
                if (job.hasNonNull("salary_max")) {
                    jobOffer.setSalaryMax(job.get("salary_max").asDouble());
                }

                // Entreprise
                if (job.has("company") && job.get("company").has("display_name")) {
                    Company company = new Company();
                    company.setName(job.get("company").get("display_name").asText());
                    jobOffer.setCompany(company);
                } else {
                    // Si le nom de l'entreprise est manquant
                    Company company = new Company();
                    company.setName("Company not available");
                    jobOffer.setCompany(company);
                }

                // URL de redirection
                if (job.hasNonNull("redirect_url")) {
                    jobOffer.setUrl(job.get("redirect_url").asText());
                } else {
                    jobOffer.setUrl("URL not available");
                }

                // Source et ID externe
                jobOffer.setApiSource("Adzuna");
                if (job.hasNonNull("id")) {
                    jobOffer.setExternalId(job.get("id").asText());
                } else {
                    jobOffer.setExternalId("ID not available");
                }

                jobOffers.add(jobOffer);
            }

            // Sauvegarder dans MongoDB
            jobOfferRepository.saveAll(jobOffers);

            return jobOffers;
        } catch (Exception e) {
            logger.error("Error while fetching jobs from Adzuna: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch jobs: " + e.getMessage());
        }
    }

}
