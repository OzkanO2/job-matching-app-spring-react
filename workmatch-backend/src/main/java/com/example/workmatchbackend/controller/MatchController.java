package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.Match;
import com.example.workmatchbackend.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/matches")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MatchController {
    @Autowired
    private MatchService matchService;

    @GetMapping
    public List<Match> getAllMatches() {
        return matchService.getAllMatches();
    }

    @GetMapping("/{id}")
    public Optional<Match> getMatchById(@PathVariable String id) {
        return matchService.getMatchById(id);
    }

    @PostMapping
    public Match createMatch(@RequestBody Match match) {
        return matchService.saveMatch(match);
    }

    @PutMapping("/{id}")
    public Match updateMatch(@PathVariable String id, @RequestBody Match matchDetails) {
        Optional<Match> optionalMatch = matchService.getMatchById(id);
        if (optionalMatch.isPresent()) {
            Match match = optionalMatch.get();
            match.setJobOffer(matchDetails.getJobOffer());
            match.setMatchedUsers(matchDetails.getMatchedUsers());
            return matchService.saveMatch(match);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteMatch(@PathVariable String id) {
        matchService.deleteMatch(id);
    }
}
