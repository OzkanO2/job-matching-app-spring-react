package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.Individual;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IndividualRepository extends MongoRepository<Individual, String> {
    Individual findByEmail(String email);
    Individual findByUsername(String username);
}
