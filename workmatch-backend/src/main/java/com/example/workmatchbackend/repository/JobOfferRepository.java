package com.example.workmatchbackend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.example.workmatchbackend.model.JobOffer;
import java.util.Optional;

@Repository
public interface JobOfferRepository extends MongoRepository<JobOffer, String> {
    JobOffer findByExternalId(String externalId); // Pour récupérer une offre
    boolean existsByExternalId(String externalId); // Pour vérifier si une offre existe

}
