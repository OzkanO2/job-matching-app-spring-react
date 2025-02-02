package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.workmatchbackend.service.LikeService;
import com.example.workmatchbackend.model.Like;

import com.example.workmatchbackend.model.User;
import com.example.workmatchbackend.repository.UserRepository;
import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.repository.JobOfferRepository;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;
    private final LikeService likeService;
    private final UserRepository userRepository;
    private final JobOfferRepository jobOfferRepository;

    @Autowired
    public MatchController(MatchService matchService, LikeService likeService, UserRepository userRepository, JobOfferRepository jobOfferRepository) {
        this.matchService = matchService;
        this.likeService = likeService;
        this.userRepository = userRepository;
        this.jobOfferRepository = jobOfferRepository;
    }
    @PostMapping("/swipe")
    public ResponseEntity<String> swipe(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");

        if (swiperId == null || swipedId == null) {
            return ResponseEntity.badRequest().body("❌ swiperId et swipedId sont requis.");
        }

        System.out.println("🟢 Swiper ID: " + swiperId);
        System.out.println("🟢 Swiped ID: " + swipedId);

        Like like = likeService.saveLike(swiperId, swipedId);

        return ResponseEntity.ok("✅ Like enregistré : " + like);
    }

}
