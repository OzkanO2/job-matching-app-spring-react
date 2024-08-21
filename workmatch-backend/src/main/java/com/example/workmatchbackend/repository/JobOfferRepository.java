package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.JobOffer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobOfferRepository extends MongoRepository<JobOffer, String> {
    JobOffer findByExternalId(String externalId); // Requête pour trouver une offre par son ID externe
}
