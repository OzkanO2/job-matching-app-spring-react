package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.JobSearcher;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobSearcherRepository extends MongoRepository<JobSearcher, String> {
    // Vous pouvez ajouter des méthodes personnalisées si nécessaire
}
