package com.example.workmatchbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.workmatchbackend.service.JobOfferService;
import com.example.workmatchbackend.model.JobOffer;

import java.util.List;

@RestController
@RequestMapping("/adzuna")
public class AdzunaJobController {

    @Autowired
    private JobOfferService jobOfferService;
    @Autowired
    private AdzunaJobService adzunaJobService;

    @GetMapping("/fetch")
    public ResponseEntity<?> fetchAndStoreJobs(
            @RequestParam String country,
            @RequestParam String what,
            @RequestParam int results_per_page
    ) {
        try {
            List<JobOffer> jobOffers = jobOfferService.fetchJobsFromAdzuna(country, what, results_per_page);
            return ResponseEntity.ok(jobOffers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching jobs: " + e.getMessage());
        }
    }

    @GetMapping("/adzuna/fetch")
    public List<JobOffer> fetchJobs(@RequestParam String country,
                                    @RequestParam String what,
                                    @RequestParam int resultsPerPage) {
        return adzunaJobService.fetchJobsFromAdzuna(country, what, resultsPerPage);
    }
}
