package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.JobOfferAdzuna;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface JobOfferAdzunaRepository extends MongoRepository<JobOfferAdzuna, String> {
    boolean existsByExternalId(String externalId);
    Optional<JobOfferAdzuna> findByExternalId(String externalId);
}
