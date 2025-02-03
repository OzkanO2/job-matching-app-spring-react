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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


@RestController
@RequestMapping("/api/matches")
public class MatchController {

    @Autowired
    private MatchService matchService;
    @Autowired
    private LikeService likeService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JobOfferRepository jobOfferRepository;

    private static final Logger logger = LoggerFactory.getLogger(MatchController.class);
    public MatchController(LikeService likeService) {
        this.likeService = likeService;
    }
    @Autowired // 🔥 Ajout de l'annotation pour l'injection automatique
    public MatchController(
            MatchService matchService,
            LikeService likeService,
            UserRepository userRepository,
            JobOfferRepository jobOfferRepository
    ) {
        this.matchService = matchService;
        this.likeService = likeService;
        this.userRepository = userRepository;
        this.jobOfferRepository = jobOfferRepository;
    }

    @PostMapping("/swipe/individual")
    public ResponseEntity<?> swipeJobOffer(@RequestBody Map<String, String> payload, @RequestHeader("Authorization") String authHeader) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");

        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.badRequest().body("❌ swiperId, swipedId et companyId sont requis.");
        }

        Like savedLike = likeService.saveLike(swiperId, swipedId, companyId);
        return ResponseEntity.ok("✅ Like enregistré avec companyId : " + savedLike);
    }

    @PostMapping("/swipe/company")
    public ResponseEntity<String> swipeJobSearcher(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId"); // Peut être null

        if (swiperId == null || swipedId == null) {
            return ResponseEntity.badRequest().body("❌ swiperId et swipedId sont requis.");
        }

        Like savedLike;
        if (companyId == null || companyId.isEmpty()) {
            savedLike = likeService.saveLike(swiperId, swipedId);
        } else {
            savedLike = likeService.saveLike(swiperId, swipedId, companyId);
        }

        return ResponseEntity.ok("✅ Like enregistré : " + savedLike);
    }

    @PostMapping("/like-job-offer")
    public ResponseEntity<?> likeJobOffer(@RequestBody Map<String, String> payload) {
        // 🔹 Extraire les valeurs depuis le JSON
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");

        // 🛑 Vérification des valeurs reçues
        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ swiperId, swipedId et companyId sont requis.");
        }

        System.out.println("📥 Données reçues:");
        System.out.println("➡️ swiperId: " + swiperId);
        System.out.println("➡️ swipedId: " + swipedId);
        System.out.println("➡️ companyId: " + companyId);

        // ✅ Sauvegarde du Like
        Like savedLike = likeService.saveLike(swiperId, swipedId, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLike);
    }

    @PostMapping("/like")
    public ResponseEntity<?> likeOffer(@RequestBody Map<String, String> payload) {
        // ✅ Extraire les valeurs de la requête
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");

        // ❌ Vérifier si une des valeurs est absente
        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ swiperId, swipedId et companyId sont requis.");
        }

        System.out.println("📥 Données reçues:");
        System.out.println("➡️ swiperId: " + swiperId);
        System.out.println("➡️ swipedId: " + swipedId);
        System.out.println("➡️ companyId: " + companyId);

        // ✅ Sauvegarde du like
        Like savedLike = likeService.saveLike(swiperId, swipedId, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLike);
    }

}
