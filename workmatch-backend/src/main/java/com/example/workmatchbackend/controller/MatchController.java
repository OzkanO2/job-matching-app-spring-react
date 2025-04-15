package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.workmatchbackend.service.LikeService;
import com.example.workmatchbackend.model.Like;

import java.util.Optional;

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
import java.util.HashMap;
import java.util.stream.Collectors;

import com.example.workmatchbackend.model.SwipedCard;
import com.example.workmatchbackend.repository.SwipedCardRepository;
import com.example.workmatchbackend.repository.LikeRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;


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
    private SwipedCardRepository swipedCardRepository;
    @Autowired
    private LikeRepository likeRepository;
    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

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
        System.out.println("Données reçues :");
        System.out.println("swiperId : " + swiperId);
        System.out.println("swipedId : " + swipedId);
        System.out.println("companyId : " + companyId);
        System.out.println("Type swiperId reçu : " + (swiperId instanceof String ? "String" : "Autre"));
        System.out.println("Longueur swiperId : " + (swiperId != null ? swiperId.length() : "null"));

        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.badRequest().body("swiperId, swipedId et companyId sont requis.");
        }

        Like savedLike = likeService.saveLike(swiperId, swipedId, companyId);
        return ResponseEntity.ok("Like enregistré avec companyId : " + savedLike);
    }

    @PostMapping("/swipe/company")
    public ResponseEntity<String> swipeJobSearcher(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.getOrDefault("companyId", "");

        if (swiperId == null || swipedId == null) {
            return ResponseEntity.badRequest().body("swiperId et swipedId sont requis.");
        }

        Like savedLike = likeService.saveLike(swiperId, swipedId, companyId, "", false);

        return ResponseEntity.ok("Like enregistré : " + savedLike);
    }

    @PostMapping("/like-job-offer")
    public ResponseEntity<?> likeJobOffer(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");

        System.out.println("Données reçues:");
        System.out.println("swiperId: " + swiperId);
        System.out.println("swipedId: " + swipedId);
        System.out.println("companyId: " + companyId);

        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("swiperId, swipedId et companyId sont requis.");
        }

        Like savedLike = likeService.saveLike(swiperId, swipedId, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLike);
    }

    @GetMapping("/reason/{userId}/{matchedUserId}")
    public ResponseEntity<Map<String, Object>> getMatchReason(@PathVariable String userId, @PathVariable String matchedUserId) {
        Map<String, Object> matchInfo = new HashMap<>();

        System.out.println("[getMatchReason] Requête reçue pour userId: " + userId + " et matchedUserId: " + matchedUserId);

        //Pourquoi `company` a liké `individual` ?
        List<SwipedCard> swipedCards = swipedCardRepository.findBySwiperIdAndSwipedId(userId, matchedUserId);
        System.out.println("[getMatchReason] Nombre de swipes trouvés pour company -> individual: " + swipedCards.size());

        List<String> jobOfferTitles = swipedCards.stream()
                .map(SwipedCard::getJobOfferId)
                .filter(offerId -> offerId != null && !offerId.isEmpty())
                .map(offerId -> jobOfferRepository.findById(offerId).map(JobOffer::getTitle).orElse(null))
                .filter(title -> title != null)
                .collect(Collectors.toList());

        if (!jobOfferTitles.isEmpty()) {
            matchInfo.put("companyReason", "L'entreprise a liké via les offres : " + String.join(", ", jobOfferTitles));
        } else {
            matchInfo.put("companyReason", "L'entreprise a liké directement, sans offre spécifique.");
        }

        //Pourquoi `individual` a liké `company` ?
        List<Like> likes = likeRepository.findBySwiperIdAndCompanyId(matchedUserId, userId);
        List<String> likedOfferTitles = likes.stream()
                .map(Like::getSwipedId)
                .map(offerId -> jobOfferRepository.findById(offerId).map(JobOffer::getTitle).orElse(null))
                .filter(title -> title != null)
                .collect(Collectors.toList());

        if (!likedOfferTitles.isEmpty()) {
            matchInfo.put("individualReason", "Le candidat a liké l'entreprise via les offres : " + String.join(", ", likedOfferTitles));
        } else {
            matchInfo.put("individualReason", "Le candidat a liké l'entreprise directement, sans offre spécifique.");
        }


        System.out.println("[getMatchReason] Résultat final envoyé : " + matchInfo);
        return ResponseEntity.ok(matchInfo);
    }


    @PostMapping("/like")
    public ResponseEntity<?> likeOffer(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");

        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("swiperId, swipedId et companyId sont requis.");
        }

        System.out.println("Données reçues:");
        System.out.println("swiperId: " + swiperId);
        System.out.println("swipedId: " + swipedId);
        System.out.println("companyId: " + companyId);

        Like savedLike = likeService.saveLike(swiperId, swipedId, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLike);
    }

    @PostMapping("/match")
    public ResponseEntity<String> checkAndCreateMatch(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");

        System.out.println("checkAndCreateMatch() appelé !");
        System.out.println("swiperId: " + swiperId);
        System.out.println("swipedId: " + swipedId);

        if (swiperId == null || swipedId == null) {
            return ResponseEntity.badRequest().body("swiperId et swipedId sont requis.");
        }

        boolean isMatch = matchService.checkIfMatchExists(swiperId, swipedId);
        System.out.println("Match détecté ? " + isMatch);

        if (isMatch) {
            boolean conversationExists = conversationRepository.existsByUser1IdAndUser2Id(swiperId, swipedId) ||
                    conversationRepository.existsByUser1IdAndUser2Id(swipedId, swiperId);

            System.out.println("Conversation existe déjà ? " + conversationExists);

            if (!conversationExists) {
                Conversation conversation = new Conversation(swiperId, swipedId);
                conversationRepository.save(conversation);
                System.out.println("Conversation créée entre " + swiperId + " et " + swipedId);
            }

            Map<String, String> matchNotif1 = new HashMap<>();
            matchNotif1.put("type", "match");
            matchNotif1.put("message", "Nouveau match !");
            matchNotif1.put("withUserId", swipedId);

            Map<String, String> matchNotif2 = new HashMap<>();
            matchNotif2.put("type", "match");
            matchNotif2.put("message", "Nouveau match !");
            matchNotif2.put("withUserId", swiperId);

            messagingTemplate.convertAndSend("/topic/notifications/" + swiperId, matchNotif1);
            messagingTemplate.convertAndSend("/topic/notifications/" + swipedId, matchNotif2);

            return ResponseEntity.ok("Match confirmé, conversation créée et notification envoyée !");
        }

        return ResponseEntity.ok("Pas encore de match, conversation non créée.");
    }

    @PostMapping("/simple-company-match-check")
    public ResponseEntity<String> simpleCompanyMatchCheck(@RequestBody Map<String, String> body) {
        String companyUserId = body.get("companyUserId");
        String candidateUserId = body.get("candidateUserId");

        if (companyUserId == null || candidateUserId == null) {
            return ResponseEntity.badRequest().body("Champs manquants");
        }

        boolean matchWasCreated = matchService.checkAndCreateMatchAfterCompanyLike(companyUserId, candidateUserId);

        if (matchWasCreated) {
            // Créer conversation si besoin
            boolean conversationExists = conversationRepository.existsByUser1IdAndUser2Id(companyUserId, candidateUserId) ||
                    conversationRepository.existsByUser1IdAndUser2Id(candidateUserId, companyUserId);

            if (!conversationExists) {
                conversationRepository.save(new Conversation(companyUserId, candidateUserId));
            }

            // Envoyer les notifications WebSocket
            Map<String, String> notif1 = new HashMap<>();
            notif1.put("type", "match");
            notif1.put("message", "Nouveau match !");
            notif1.put("withUserId", candidateUserId);
            notif1.put("conversationId", companyUserId + "_" + candidateUserId);
            notif1.put("senderId", candidateUserId);

            Map<String, String> notif2 = new HashMap<>();
            notif2.put("type", "match");
            notif2.put("message", "Nouveau match !");
            notif2.put("withUserId", companyUserId);
            notif2.put("conversationId", companyUserId + "_" + candidateUserId);
            notif2.put("senderId", companyUserId);

            messagingTemplate.convertAndSend("/topic/notifications/" + companyUserId, notif1);
            messagingTemplate.convertAndSend("/topic/notifications/" + candidateUserId, notif2);

            return ResponseEntity.ok("Match créé, conversation et notifications envoyées.");
        }

        return ResponseEntity.ok("Pas encore de match.");
    }


}
