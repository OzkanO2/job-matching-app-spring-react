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
import com.example.workmatchbackend.repository.ConversationRepository;
import com.example.workmatchbackend.model.Conversation;
import java.util.List;

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

    @Autowired
    private ConversationRepository conversationRepository;

    private static final Logger logger = LoggerFactory.getLogger(MatchController.class);

    public MatchController(LikeService likeService) {
        this.likeService = likeService;
    }

    @Autowired
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

    @GetMapping("/conversations/{userId}")
    public List<Conversation> getConversations(@PathVariable String userId) {
        return conversationRepository.findByUser1IdOrUser2Id(userId, userId);
    }

    @PostMapping("/swipe/individual")
    public ResponseEntity<?> swipeJobOffer(@RequestBody Map<String, String> payload, @RequestHeader("Authorization") String authHeader) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");
        System.out.println("📥 Données reçues :");
        System.out.println("➡️ swiperId : " + swiperId);
        System.out.println("➡️ swipedId : " + swipedId);
        System.out.println("➡️ companyId : " + companyId);
        System.out.println("📌 Type swiperId reçu : " + (swiperId instanceof String ? "String" : "Autre"));
        System.out.println("📌 Longueur swiperId : " + (swiperId != null ? swiperId.length() : "null"));

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
        String companyId = payload.getOrDefault("companyId", "");

        if (swiperId == null || swipedId == null) {
            return ResponseEntity.badRequest().body("❌ swiperId et swipedId sont requis.");
        }

        Like savedLike = likeService.saveLike(swiperId, swipedId, companyId, "", false); // ✅ Correction

        return ResponseEntity.ok("✅ Like enregistré : " + savedLike);
    }

    @PostMapping("/like-job-offer")
    public ResponseEntity<?> likeJobOffer(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");

        System.out.println("📥 Données reçues:");
        System.out.println("➡️ swiperId: " + swiperId);
        System.out.println("➡️ swipedId: " + swipedId);
        System.out.println("➡️ companyId: " + companyId);

        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ swiperId, swipedId et companyId sont requis.");
        }

        Like savedLike = likeService.saveLike(swiperId, swipedId, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLike);
    }

    @PostMapping("/like")
    public ResponseEntity<?> likeOffer(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");

        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ swiperId, swipedId et companyId sont requis.");
        }

        System.out.println("📥 Données reçues:");
        System.out.println("➡️ swiperId: " + swiperId);
        System.out.println("➡️ swipedId: " + swipedId);
        System.out.println("➡️ companyId: " + companyId);

        Like savedLike = likeService.saveLike(swiperId, swipedId, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLike);
    }

    @PostMapping("/match")
    public ResponseEntity<String> checkAndCreateMatch(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");

        System.out.println("📌 checkAndCreateMatch() appelé !");
        System.out.println("➡️ swiperId: " + swiperId);
        System.out.println("➡️ swipedId: " + swipedId);

        if (swiperId == null || swipedId == null) {
            return ResponseEntity.badRequest().body("❌ swiperId et swipedId sont requis.");
        }

        boolean isMatch = matchService.checkIfMatchExists(swiperId, swipedId);
        System.out.println("📌 Match détecté ? " + isMatch);

        if (isMatch) {
            boolean conversationExists = conversationRepository.existsByUser1IdAndUser2Id(swiperId, swipedId) ||
                    conversationRepository.existsByUser1IdAndUser2Id(swipedId, swiperId);

            System.out.println("📌 Conversation existe déjà ? " + conversationExists);

            if (!conversationExists) {
                Conversation conversation = new Conversation(swiperId, swipedId);
                conversationRepository.save(conversation);
                System.out.println("✅ Conversation créée entre " + swiperId + " et " + swipedId);
            }

            return ResponseEntity.ok("✅ Match confirmé et conversation créée !");
        }

        return ResponseEntity.ok("⚠️ Pas encore de match, conversation non créée.");
    }
}
