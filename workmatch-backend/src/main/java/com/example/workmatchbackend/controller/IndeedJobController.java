package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.service.IndeedJobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/indeed")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class IndeedJobController {

    @Autowired
    private IndeedJobService indeedJobService;
    @Autowired
    public IndeedJobController(IndeedJobService indeedJobService) {
        this.indeedJobService = indeedJobService;
    }
    @GetMapping("/fetch")
    public List<JobOffer> fetchJobOffers(@RequestParam String location) {
        return indeedJobService.fetchAndSaveJobOffers(location);
    }
}
