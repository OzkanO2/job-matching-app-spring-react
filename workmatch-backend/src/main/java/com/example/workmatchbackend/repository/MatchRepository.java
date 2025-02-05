package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.Match;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MatchRepository extends MongoRepository<Match, String> {
    // Trouve un match entre deux utilisateurs (ordre spécifique)
    Optional<Match> findBySwiperIdAndSwipedId(String swiperId, String swipedId);

    // Trouve tous les matchs impliquant un utilisateur
    List<Match> findBySwiperIdOrSwipedId(String swiperId, String swipedId);
}