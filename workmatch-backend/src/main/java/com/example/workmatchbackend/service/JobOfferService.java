package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Optional;

import java.util.List;
import java.util.Optional;

@Service
public class JobOfferService {

    private final RestTemplate restTemplate;
    private final JobOfferRepository jobOfferRepository;

    @Autowired
    public JobOfferService(@Qualifier("adzunaRestTemplate") RestTemplate restTemplate, JobOfferRepository jobOfferRepository) {
        this.restTemplate = restTemplate;
        this.jobOfferRepository = jobOfferRepository;
    }

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

    public JobOffer findByExternalId(String externalId) {
        return jobOfferRepository.findByExternalId(externalId);
    }

    public List<JobOffer> fetchJobsFromAdzuna(String country, String what, int resultsPerPage) {
        // Implémentez la logique pour appeler l'API Adzuna et convertir les données en JobOffer
        // Exemple de structure possible
        return List.of(); // Remplacez par la liste des offres d'emploi obtenues
    }
}
