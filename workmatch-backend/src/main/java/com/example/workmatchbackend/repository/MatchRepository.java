package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.Match;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends MongoRepository<Match, String> {
    Optional<Match> findByIndividualUserIdAndCompanyUserId(String individualUserId, String companyUserId);
    List<Match> findByIndividualUserIdOrCompanyUserId(String userId1, String userId2);
    boolean existsByIndividualUserIdAndCompanyUserId(String individualUserId, String companyUserId);

    boolean existsByCompanyUserIdAndIndividualUserId(String companyUserId, String individualUserId);
}
