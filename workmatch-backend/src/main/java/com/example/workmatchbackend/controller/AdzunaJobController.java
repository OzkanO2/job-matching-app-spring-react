package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.service.AdzunaJobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/adzuna")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdzunaJobController {

    @Autowired
    private AdzunaJobService adzunaJobService;

    @GetMapping("/fetch")
    public List<JobOffer> fetchJobOffers(@RequestParam String country, @RequestParam String what) {
        try {
            System.out.println("On rentre bien dans le fetch du controller adzuna");
            List<JobOffer> jobOffers = adzunaJobService.fetchAndSaveJobOffers(country, what);
            System.out.println("Job offers fetched: " + jobOffers);
            return jobOffers;
        } catch (Exception e) {
            System.err.println("Failed to fetch job offers: " + e.getMessage());
            return List.of();
        }
    }
}
