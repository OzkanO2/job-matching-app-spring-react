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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.bson.types.ObjectId;

import java.util.List;
import java.util.Optional;

@Service
public class JobOfferService {

    @Autowired
    private RestTemplate restTemplate; // ✅ Injection correcte

    private final JobOfferRepository jobOfferRepository;
    private static final Logger logger = LoggerFactory.getLogger(JobOfferService.class);

    @Autowired
    public JobOfferService(JobOfferRepository jobOfferRepository) {
        this.jobOfferRepository = jobOfferRepository;
    }
    public List<JobOffer> getAllJobOffers() {
        return jobOfferRepository.findAll();  // ✅ Aucune conversion nécessaire
    }


    public Optional<JobOffer> getJobOfferById(String jobOfferId) {
        return jobOfferRepository.findById(jobOfferId);
    }

    public JobOffer saveJobOffer(JobOffer jobOffer) {
        return jobOfferRepository.save(jobOffer);
    }

    public void deleteJobOffer(String id) {
        jobOfferRepository.deleteById(id);
    }

    public JobOffer findByExternalId(String externalId) {
        return jobOfferRepository.findByExternalId(externalId).orElse(null);
    }
    public List<JobOffer> getJobOffersByCompanyId(String companyId) {
        logger.info("🔍 Recherche des offres pour companyId: {}", companyId);

        try {
            ObjectId companyObjectId = new ObjectId(companyId); // ✅ Convertir String en ObjectId
            List<JobOffer> jobOffers = jobOfferRepository.findByCompanyId(companyObjectId);

            logger.info("📊 Nombre d'offres trouvées : {}", jobOffers.size());
            return jobOffers;
        } catch (IllegalArgumentException e) {
            logger.error("❌ Format incorrect pour companyId : {}", companyId, e);
            return List.of();
        }
    }
    public List<JobOffer> fetchJobsFromAdzuna(String country, String what, int resultsPerPage) {
        // Implémentez la logique pour appeler l'API Adzuna et convertir les données en JobOffer
        // Exemple de structure possible
        return List.of(); // Remplacez par la liste des offres d'emploi obtenues
    }
}
