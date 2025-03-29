package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.JobSearcher;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.bson.types.ObjectId;

@Repository
public interface JobSearcherRepository extends MongoRepository<JobSearcher, String> {
    Optional<JobSearcher> findById(String id);
    Optional<JobSearcher> findByUserId(ObjectId userId);
    void deleteByUserId(ObjectId userId);

    @Query(value = "{ '_id': ?0 }", fields = "{ 'userId': 1 }")
    Optional<JobSearcher> findUserIdByJobSearcherId(String jobSearcherId);
}
