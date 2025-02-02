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
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.stereotype.Controller;

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
    public ResponseEntity<String> swipe(@RequestParam String swiperId, @RequestParam String swipedId, @RequestParam(required = false) String offerId) {
        System.out.println("🔍 Searching for swiperId in database: " + swiperId);

        User swiper = userRepository.findById(swiperId).orElseThrow(() -> new RuntimeException("User not found"));

        if (swiper.getUserType().equals("COMPANY")) {
            // 🔹 COMPANY swiping an INDIVIDUAL (job searcher)
            Like like = new Like(swiperId, swipedId);
            likeService.saveLike(like);
        } else if (swiper.getUserType().equals("INDIVIDUAL")) {
            JobOffer jobOffer = jobOfferRepository.findById(offerId)
                    .orElseThrow(() -> new RuntimeException("Job Offer not found"));
            Like like = new Like(swiperId, offerId, jobOffer.getCompanyId()); // 🔹 Utilisation correcte de getCompanyId()
            likeService.saveLike(like);

        }

        // Vérifier si un match existe
        boolean isMatch = likeService.checkForMatch(swiperId, swipedId);
        if (isMatch) {
            matchService.createMatch(swiperId, swipedId);
            return ResponseEntity.ok("It's a match! Start chatting.");
        } else {
            return ResponseEntity.ok("Like recorded.");
        }
    }
}
