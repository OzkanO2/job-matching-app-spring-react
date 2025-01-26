package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.Match;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.List;

public interface MatchRepository extends MongoRepository<Match, String> {
    // Trouve un match entre deux utilisateurs (ordre spécifique)
    Optional<Match> findByUserId1AndUserId2(String userId1, String userId2);

    // Trouve tous les matchs impliquant un utilisateur
    List<Match> findAllByUserId1OrUserId2(String userId1, String userId2);
}
