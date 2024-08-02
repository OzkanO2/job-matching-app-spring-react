package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobOfferService {
    @Autowired
    private JobOfferRepository jobOfferRepository;

    public List<JobOffer> getAllJobOffers() {
        return jobOfferRepository.findAll();
    }

    public Optional<JobOffer> getJobOfferById(String id) {
        return jobOfferRepository.findById(id);
    }

    public JobOffer saveJobOffer(JobOffer jobOffer) {
        return jobOfferRepository.save(jobOffer);
    }

    public void deleteJobOffer(String id) {
        jobOfferRepository.deleteById(id);
    }
}
