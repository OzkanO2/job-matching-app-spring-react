package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
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

    private static final String API_URL = "https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=b50d337a&app_key=7a9d8272a034e629a9f62ae0adb917ba&results_per_page=100&what=software%20developer";

    public List<JobOffer> fetchAndSaveJobOffers() {
        try {
            Map<String, Object> response = restTemplate.getForObject(API_URL, Map.class);

            if (response != null) {
                System.out.println("API Response: " + response); // Log the response
                List<Map<String, Object>> jobs = (List<Map<String, Object>>) response.get("results");

                List<JobOffer> jobOffers = new ArrayList<>();
                for (Map<String, Object> job : jobs) {
                    JobOffer jobOffer = new JobOffer();
                    jobOffer.setInfo((String) job.get("title"));
                    jobOffer.setCompetences((List<String>) job.get("category"));
                    jobOffer.setTag(1); // Vous pouvez définir une logique pour le tag
//                    jobOffer.setCompany((String) ((Map<String, Object>) job.get("company")).get("display_name"));
//                    jobOffer.setLocation((String) ((Map<String, Object>) job.get("location")).get("display_name"));
//                    jobOffer.setDescription((String) job.get("description"));
//                    jobOffer.setSalaryMin((Double) job.get("salary_min"));
//                    jobOffer.setSalaryMax((Double) job.get("salary_max"));
//                    jobOffer.setUrl((String) job.get("redirect_url"));

                    jobOfferRepository.save(jobOffer);
                    jobOffers.add(jobOffer);
                }
                return jobOffers;
            } else {
                System.out.println("API Response is null");
                return null;
            }
        } catch (HttpClientErrorException e) {
            System.out.println("HTTP Error: " + e.getStatusCode());
            System.out.println("HTTP Response Body: " + e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
