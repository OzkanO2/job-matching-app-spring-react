package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.service.JobOfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/joboffers")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class JobOfferController {
    @Autowired
    private JobOfferService jobOfferService;

    @GetMapping
    public List<JobOffer> getAllJobOffers() {
        return jobOfferService.getAllJobOffers();
    }

    @GetMapping("/{id}")
    public Optional<JobOffer> getJobOfferById(@PathVariable String id) {
        return jobOfferService.getJobOfferById(id);
    }

    @PostMapping
    public JobOffer createJobOffer(@RequestBody JobOffer jobOffer) {
        return jobOfferService.saveJobOffer(jobOffer);
    }

    @PutMapping("/{id}")
    public JobOffer updateJobOffer(@PathVariable String id, @RequestBody JobOffer jobOfferDetails) {
        Optional<JobOffer> optionalJobOffer = jobOfferService.getJobOfferById(id);
        if (optionalJobOffer.isPresent()) {
            JobOffer jobOffer = optionalJobOffer.get();
            jobOffer.setInfo(jobOfferDetails.getInfo());
            jobOffer.setCompetences(jobOfferDetails.getCompetences());
            jobOffer.setTag(jobOfferDetails.getTag());
            return jobOfferService.saveJobOffer(jobOffer);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteJobOffer(@PathVariable String id) {
        jobOfferService.deleteJobOffer(id);
    }
}
