package com.example.workmatchbackend.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import com.example.workmatchbackend.service.AdzunaJobService;
import com.example.workmatchbackend.model.JobOffer;

import java.util.List;

@RestController
@RequestMapping("/adzuna")
public class AdzunaJobController {

    @Autowired
    private AdzunaJobService adzunaJobService;

    /*@GetMapping("/jobs")
    public ResponseEntity<?> getAllAdzunaJobs() {
        try {
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching jobs: " + e.getMessage());
        }
    }*/

    @GetMapping("/jobs")
    public ResponseEntity<?> getAllAdzunaJobs() {
        try {
            String country = "us"; // ou "ca", "gb", etc.

            String[] keywords = {
                    "software developer", "software engineer", "frontend developer", "backend developer", "java developer",
                    "python developer", "react developer", "node.js developer", "devops engineer", "data scientist",
                    "data engineer", "cybersecurity", "it support", "cloud engineer", "solution architect",
                    "business analyst", "ai engineer", "ml engineer", "marketing technology", "full stack developer"
            };

            for (String keyword : keywords) {
                adzunaJobService.fetchAndSaveUniqueJobs(country, keyword, 120);
            }


            return ResponseEntity.ok("✅ Import multiple terminé !");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Erreur lors de l'import multiple : " + e.getMessage());
        }
    }

}
