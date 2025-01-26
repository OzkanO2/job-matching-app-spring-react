package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @PostMapping("/swipe")
    public ResponseEntity<String> swipe(@RequestParam String swiperId, @RequestParam String swipedId) {
        boolean isMatch = matchService.checkAndCreateMatch(swiperId, swipedId);

        if (isMatch) {
            return ResponseEntity.ok("It's a match! Start chatting.");
        } else {
            return ResponseEntity.ok("Swipe recorded.");
        }
    }
}
