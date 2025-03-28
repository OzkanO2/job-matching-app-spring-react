package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.JobOffer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import org.springframework.data.mongodb.repository.Query;
import org.bson.types.ObjectId;

@Repository
public interface JobOfferRepository extends MongoRepository<JobOffer, String> {
    boolean existsByExternalId(String externalId);

    @Query(value = "{ 'companyId': ?0 }", fields = "{ '_id': 1 }")
    List<ObjectId> findOfferIdsByCompanyId(ObjectId companyId);


    Optional<JobOffer> findById(String id);

    Optional<JobOffer> findByExternalId(String externalId);

    List<JobOffer> findByCompanyId(ObjectId companyId);
    List<JobOffer> findAllByCompanyId(ObjectId companyId);

    void deleteByCompanyId(ObjectId companyId); // 👈 ajoute celle-ci si elle n'y est pas

}
