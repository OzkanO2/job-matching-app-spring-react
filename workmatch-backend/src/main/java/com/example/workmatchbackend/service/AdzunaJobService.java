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

import java.time.LocalDate;
import java.util.UUID;
import org.bson.types.ObjectId;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdzunaJobService {

    @Autowired
    private JobOfferRepository jobOfferRepository;
    private static final Logger logger = LoggerFactory.getLogger(AdzunaJobService.class);
    @Autowired
    private CompanyService companyService;

    public void fetchAndSaveUniqueJobs(String country, String keyword, int totalDesired) {
        RestTemplate restTemplate = new RestTemplate();
        int savedCount = 0;
        int page = 1;

        while (savedCount < totalDesired) {
            String apiUrl = "https://api.adzuna.com/v1/api/jobs/" + country + "/search/" + page
                    + "?app_id=b50d337a&app_key=7a9d8272a034e629a9f62ae0adb917ba"
                    + "&what=" + keyword
                    + "&results_per_page=50"
                    + "&content-type=application/json";

            try {
                ResponseEntity<JsonNode> response = restTemplate.getForEntity(apiUrl, JsonNode.class);
                JsonNode jobs = response.getBody().get("results");

                if (jobs == null || jobs.size() == 0) break;

                for (JsonNode job : jobs) {
                    String title = job.path("title").asText("").toLowerCase();
                    String category = job.path("category").path("label").asText("").toLowerCase();

                    // ❌ Exclusion des offres non IT (ex: enseignants, santé, etc.)
                    String[] excludedKeywords = {
                            "teacher", "professor", "instructor", "nurse", "hospital", "health",
                            "clinic", "biology", "pharmacy", "psychology", "education", "student",
                            "mathematics", "english", "history", "mental", "school"
                    };

                    boolean containsExcluded = false;
                    for (String excluded : excludedKeywords) {
                        if (title.contains(excluded) || category.contains(excluded)) {
                            containsExcluded = true;
                            break;
                        }
                    }

                    if (containsExcluded) continue;

                    // ✅ Inclure seulement les vrais postes IT
                    if (!(title.contains("developer") || title.contains("engineer") || title.contains("software") || title.contains("it")
                            || category.contains("tech") || category.contains("software") || category.contains("developer")
                            || category.contains("data") || category.contains("it") || category.contains("engineering")
                            || category.contains("cloud") || category.contains("cyber"))) {
                        continue;
                    }

                    // 🔁 Éviter les doublons par titre
                    if (jobOfferRepository.existsByTitle(title)) {
                        continue;
                    }

                    JobOffer jobOffer = new JobOffer();
                    jobOffer.setTitle(job.path("title").asText("Untitled"));
                    jobOffer.setDescription(job.hasNonNull("description") ? job.get("description").asText() : "No description");
                    jobOffer.setLocations(List.of(job.path("location").path("display_name").asText("Unknown")));
                    jobOffer.setSalaryMin(job.path("salary_min").asDouble(0));
                    jobOffer.setSalaryMax(job.path("salary_max").asDouble(0));
                    jobOffer.setUrl(job.path("redirect_url").asText("URL not available"));
                    jobOffer.setApiSource("Adzuna");
                    jobOffer.setExternalId(job.path("id").asText("ID not available"));
                    jobOffer.setCategory(job.path("category").path("label").asText("Other"));
                    jobOffer.setEmploymentType(job.path("contract_time").asText("full_time"));
                    jobOffer.setRemote(job.path("remote").asBoolean(false));
                    jobOffer.setCreatedAt(LocalDate.now());

                    Company company = new Company();
                    company.setName("Adzuna Inc.");
                    company.setCertified(false);
                    company = companyService.saveCompany(company);
                    jobOffer.setCompanyId(new ObjectId(company.getId()));

                    jobOfferRepository.save(jobOffer);
                    savedCount++;

                    if (savedCount >= totalDesired) break;
                }

                page++;

            } catch (Exception e) {
                e.printStackTrace();
                break;
            }
        }

        System.out.println("✅ Import IT terminé. Total offres uniques ajoutées : " + savedCount);
    }


    /*public List<JobOffer> fetchJobsFromAdzuna(String country, String what, int resultsPerPage) {
        String apiUrl = "https://api.adzuna.com/v1/api/jobs/" + country + "/search/1";
        apiUrl += "?app_id=b50d337a&app_key=7a9d8272a034e629a9f62ae0adb917ba";
        apiUrl += "&what=" + what + "&results_per_page=" + resultsPerPage;

        logger.info("Fetching jobs from Adzuna API for country: {} and domain: {}", country, what);

        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<JsonNode> response = restTemplate.getForEntity(apiUrl, JsonNode.class);
            logger.info("Received response from Adzuna API");
            JsonNode jobs = response.getBody().get("results");

            for (JsonNode job : jobs) {
                JobOffer jobOffer = new JobOffer();

                String companyName = job.has("company") && job.get("company").hasNonNull("display_name")
                        ? job.get("company").get("display_name").asText()
                        : null;

                jobOffer.setTitle(job.hasNonNull("title") ? job.get("title").asText() : "Title not available");
                jobOffer.setDescription(job.hasNonNull("description") ? job.get("description").asText() : "Description not available");
                jobOffer.setLocations(job.has("location") && job.get("location").hasNonNull("display_name")
                        ? List.of(job.get("location").get("display_name").asText())
                        : List.of("Location not available"));

                jobOffer.setSalaryMin(job.hasNonNull("salary_min") ? job.get("salary_min").asDouble() : 0.0);
                jobOffer.setSalaryMax(job.hasNonNull("salary_max") ? job.get("salary_max").asDouble() : 0.0);
                jobOffer.setUrl(job.hasNonNull("redirect_url") ? job.get("redirect_url").asText() : "URL not available");
                jobOffer.setApiSource("Adzuna");
                jobOffer.setExternalId(job.hasNonNull("id") ? job.get("id").asText() : "ID not available");
                jobOffer.setCategory(job.has("category") ? job.get("category").asText() : null);
                jobOffer.setEmploymentType(job.has("employment_type") ? job.get("employment_type").asText() : null);
                jobOffer.setRemote(job.has("remote") ? job.get("remote").asBoolean() : false);
                jobOffer.setCreatedAt(job.has("created_at") ? LocalDate.parse(job.get("created_at").asText()) : null);

                Company company = null;
                if (companyName != null) {
                    company = companyService.getCompanyByName(companyName);
                    if (company == null) {
                        company = new Company();
                        company.setName(companyName);
                        company.setCertified(false);
                        company = companyService.saveCompany(company);
                    }
                } else {
                    company = new Company();
                    company.setName("Unknown Company");
                    company.setCertified(false);
                    company = companyService.saveCompany(company);
                    logger.info("Company saved: {}" +
                            "" +
                            "" +
                            "" +
                            "" +
                            "", company);
                }

                if (!jobOfferRepository.existsByExternalId(jobOffer.getExternalId())) {
                    jobOfferRepository.save(jobOffer);
                    logger.info("JobOffer saved: {}" +
                            "" +
                            "" +
                            "" +
                            "" +
                            "" +
                            "" +
                            "", jobOffer);
                    logger.info("Saved job: {}", jobOffer.getTitle());
                } else {
                    logger.info("Job already exists: {}", jobOffer.getTitle());
                }
            }

        } catch (Exception e) {
            logger.error("Error while fetching jobs from Adzuna: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch jobs: " + e.getMessage());
        }
        return null;
    }*/
}
