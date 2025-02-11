package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.service.AdzunaImportService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/adzuna-import")
public class AdzunaImportController {

    @Autowired
    private AdzunaImportService adzunaImportService;

    @GetMapping("/fetch-it-jobs")
    public ResponseEntity<?> fetchITJobs() {
        try {
            adzunaImportService.fetchAndStoreITJobs();
            return ResponseEntity.ok("Offres IT récupérées et stockées !");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur: " + e.getMessage());
        }
    }
}
