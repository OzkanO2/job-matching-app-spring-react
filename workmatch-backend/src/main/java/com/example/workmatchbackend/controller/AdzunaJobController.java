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
    public List<JobOffer> fetchJobOffers() {
        return adzunaJobService.fetchAndSaveJobOffers();
    }
}
