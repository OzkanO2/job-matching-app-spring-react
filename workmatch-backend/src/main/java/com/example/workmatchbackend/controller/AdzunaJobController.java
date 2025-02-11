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

    @GetMapping("/jobs")
    public ResponseEntity<?> getAllAdzunaJobs() {
        try {
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching jobs: " + e.getMessage());
        }
    }
}
