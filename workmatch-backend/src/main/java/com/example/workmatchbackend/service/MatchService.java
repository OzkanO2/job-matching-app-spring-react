package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.Match;
import com.example.workmatchbackend.repository.MatchRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class MatchService {

    private final MatchRepository matchRepository;

    public MatchService(MatchRepository matchRepository) {
        this.matchRepository = matchRepository;
    }
    public List<Match> getMatchesForUser(String userId) {
        return matchRepository.findAllByUserId1OrUserId2(userId, userId);
    }

    // Méthode pour enregistrer un nouveau match
    public void saveMatch(Match match) {
        matchRepository.save(match);
    }
    // Vérifie si un match existe déjà ou crée un nouveau match
    public boolean checkAndCreateMatch(String userId1, String userId2) {
        // Vérifie si un match existe dans les deux sens
        Optional<Match> existingMatch1 = matchRepository.findByUserId1AndUserId2(userId1, userId2);
        Optional<Match> existingMatch2 = matchRepository.findByUserId1AndUserId2(userId2, userId1);

        if (existingMatch1.isPresent() || existingMatch2.isPresent()) {
            return false; // Match déjà existant
        }

        // Crée un nouveau match
        Match newMatch = new Match(userId1, userId2);
        matchRepository.save(newMatch);
        return true; // Match créé
    }
    public void createMatch(String userId1, String userId2) {
        Match match = new Match(userId1, userId2);
        matchRepository.save(match);
    }

}
