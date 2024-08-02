package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.Match;
import com.example.workmatchbackend.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MatchService {
    @Autowired
    private MatchRepository matchRepository;

    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    public Optional<Match> getMatchById(String id) {
        return matchRepository.findById(id);
    }

    public Match saveMatch(Match match) {
        return matchRepository.save(match);
    }

    public void deleteMatch(String id) {
        matchRepository.deleteById(id);
    }
}
