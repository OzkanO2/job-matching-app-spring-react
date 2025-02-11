package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.JobSearcher;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface JobSearcherRepository extends MongoRepository<JobSearcher, String> {
    Optional<JobSearcher> findById(String id);

    @Query(value = "{ '_id': ?0 }", fields = "{ 'userId': 1 }")
    Optional<JobSearcher> findUserIdByJobSearcherId(String jobSearcherId);
}
