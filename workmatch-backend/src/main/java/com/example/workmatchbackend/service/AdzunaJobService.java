package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.repository.JobOfferRepository;
import com.example.workmatchbackend.model.Company;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;

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
                jobOffer.setTitle(job.hasNonNull("title") ? job.get("title").asText() : "Title not available");

                // Description
                jobOffer.setDescription(job.hasNonNull("description") ? job.get("description").asText() : "Description not available");

                // Localisation
                jobOffer.setLocation(job.has("location") && job.get("location").hasNonNull("display_name")
                        ? job.get("location").get("display_name").asText()
                        : "Location not available");

                // Salaire minimum
                jobOffer.setSalaryMin(job.hasNonNull("salary_min") ? job.get("salary_min").asDouble() : null);

                // Salaire maximum
                jobOffer.setSalaryMax(job.hasNonNull("salary_max") ? job.get("salary_max").asDouble() : null);

                // Entreprise
                if (job.has("company") && job.get("company").has("display_name")) {
                    Company company = new Company();
                    company.setName(job.get("company").get("display_name").asText());
                    jobOffer.setCompany(company);
                } else {
                    Company company = new Company();
                    company.setName("Company not available");
                    jobOffer.setCompany(company);
                }

                // URL de redirection
                jobOffer.setUrl(job.hasNonNull("redirect_url") ? job.get("redirect_url").asText() : "URL not available");

                // Source et ID externe
                jobOffer.setApiSource("Adzuna");
                jobOffer.setExternalId(job.hasNonNull("id") ? job.get("id").asText() : "ID not available");

                // Ajout de champs spécifiques
                jobOffer.setCategory(job.hasNonNull("category") ? job.get("category").asText() : "Category not available");
                jobOffer.setEmploymentType(job.hasNonNull("contract_type") ? job.get("contract_type").asText() : "Not specified");
                jobOffer.setRemote(job.hasNonNull("remote") ? job.get("remote").asBoolean() : false);
                jobOffer.setCreatedAt(job.hasNonNull("created") ? job.get("created").asText() : "Date not available");

                // Tags, compétences et informations supplémentaires
                jobOffer.setTag(job.hasNonNull("tag") ? job.get("tag").asText() : null);
                jobOffer.setCompetences(job.hasNonNull("competences") ? job.get("competences").asText() : null);
                jobOffer.setInfo(job.hasNonNull("info") ? job.get("info").asText() : null);

                // Ajouter l'offre à la liste
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
