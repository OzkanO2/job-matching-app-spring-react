package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobOffer;
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

    private final RestTemplate restTemplate;

    public AdzunaJobService(@Qualifier("adzunaRestTemplate") RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private static final String BASE_API_URL = "https://api.adzuna.com/v1/api/jobs/";

    public List<JobOffer> fetchAndSaveJobOffers(String country, String what) {
        try {
            String apiUrl = String.format("%s%s/search/1?app_id=b50d337a&app_key=7a9d8272a034e629a9f62ae0adb917ba&results_per_page=100&what=%s", BASE_API_URL, country, what);
            Map<String, Object> response = restTemplate.getForObject(apiUrl, Map.class);

            if (response != null) {
                System.out.println("API Response: " + response); // Log the response

                List<Map<String, Object>> jobs = (List<Map<String, Object>>) response.get("results");
                List<JobOffer> jobOffers = new ArrayList<>();
                for (Map<String, Object> job : jobs) {
                    JobOffer jobOffer = new JobOffer();
                    jobOffer.setInfo((String) job.get("title"));
                    jobOffers.add(jobOffer);
                }
                return jobOffers;
            } else {
                System.out.println("API Response is null");
                return new ArrayList<>();
            }
        } catch (HttpClientErrorException e) {
            System.out.println("HTTP Error: " + e.getStatusCode());
            System.out.println("HTTP Response Body: " + e.getResponseBodyAsString());
            return new ArrayList<>();
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}
