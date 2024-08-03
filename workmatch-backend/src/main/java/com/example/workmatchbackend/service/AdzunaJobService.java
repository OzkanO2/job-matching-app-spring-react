package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AdzunaJobService {

    @Autowired
    private JobOfferRepository jobOfferRepository;

    private final RestTemplate restTemplate;

    public AdzunaJobService(@Qualifier("adzunaRestTemplate") RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    private static final String API_URL = "https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY&results_per_page=100&what=software%20developer";

    public List<JobOffer> fetchAndSaveJobOffers() {
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> response = restTemplate.getForObject(API_URL, Map.class);

        List<Map<String, Object>> jobs = (List<Map<String, Object>>) response.get("results");

        for (Map<String, Object> job : jobs) {
            JobOffer jobOffer = new JobOffer();
            jobOffer.setInfo((String) job.get("title"));
            jobOffer.setCompetences((List<String>) job.get("category"));
            jobOffer.setTag(1); // Vous pouvez définir une logique pour le tag

            jobOfferRepository.save(jobOffer);
        }
        return jobOfferRepository.findAll();
    }
}
