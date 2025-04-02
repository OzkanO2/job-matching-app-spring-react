package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.SwipedCard;
import com.example.workmatchbackend.repository.SwipedCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Collections;
import java.util.Set;

import com.example.workmatchbackend.model.JobSearcher;
import com.example.workmatchbackend.repository.JobSearcherRepository;
import org.bson.types.ObjectId;
import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.repository.JobOfferRepository;
import com.example.workmatchbackend.repository.SwipedCardRepository;
import com.example.workmatchbackend.model.SwipedCard;

@RestController
@RequestMapping("/api/swiped")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SwipeController {

    @Autowired
    private SwipedCardRepository swipedCardRepository;

    @Autowired
    private JobSearcherRepository jobSearcherRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @GetMapping("/filteredJobSearchers/{swiperId}/{jobOfferId}")
    public ResponseEntity<?> getFilteredJobSearchers(
            @PathVariable String swiperId,
            @PathVariable String jobOfferId) {

        if (swiperId == null || swiperId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("swiperId est requis.");
        }

        if (jobOfferId == null || jobOfferId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("jobOfferId est requis.");
        }

        System.out.println("Début API filteredJobSearchers avec swiperId : " + swiperId + " et jobOfferId : " + jobOfferId);

        //Récupérer les swipes "left" pour cette offre
        List<SwipedCard> leftSwipesForOffer = swipedCardRepository.findBySwipedIdAndDirection(jobOfferId, "left");

        //Extraire les `swiperId` (ceux qui ont swipé cette offre à gauche)
        List<String> swipedUserIdsForOffer = leftSwipesForOffer.stream()
                .map(SwipedCard::getSwiperId)  //Ici on prend swiperId car c'est l'utilisateur qui a swipé
                .collect(Collectors.toList());

        System.out.println("Candidats ayant swipé cette offre à gauche (userId) : " + swipedUserIdsForOffer);

        //Récupérer tous les job searchers
        List<JobSearcher> jobSearchers = jobSearcherRepository.findAll();

        //Filtrer les candidats
        List<JobSearcher> filteredJobSearchers = jobSearchers.stream()
                .filter(jobSearcher -> {
                    String userId = jobSearcher.getUserId().toString();  // 🛠 Convertit ObjectId en String
                    boolean hasSwipedLeftForOffer = swipedUserIdsForOffer.contains(userId);

                    if (hasSwipedLeftForOffer) {
                        System.out.println("Exclusion du candidat : " + jobSearcher.getName() + " | ID: " + userId);
                    } else {
                        System.out.println("Conservation du candidat : " + jobSearcher.getName() + " | ID: " + userId);
                    }

                    return !hasSwipedLeftForOffer;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredJobSearchers);
    }

    @GetMapping("/checkCompanySwipe")
    public ResponseEntity<Map<String, Boolean>> checkCompanySwipe(
            @RequestParam String companyId,
            @RequestParam String userId,
            @RequestParam String jobOfferId) {

        boolean exists = swipedCardRepository.existsBySwiperIdAndSwipedIdAndDirectionAndJobOfferIdAndIsFromRedirection(
                companyId, userId, "left", jobOfferId, true
        );

        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/checkCompanySwipeNormal")
    public ResponseEntity<Map<String, Boolean>> checkCompanySwipeNormal(
            @RequestParam String companyId,
            @RequestParam String userId) {

        boolean exists = swipedCardRepository.existsBySwiperIdAndSwipedIdAndDirectionAndJobOfferIdAndIsFromRedirection(
                companyId, userId, "left", "", false
        );

        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/company/swipes/{companyId}")
    public ResponseEntity<?> getCandidateSwipeCounts(@PathVariable String companyId) {

        if (companyId == null || companyId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("companyId est requis.");
        }

        List<JobOffer> companyOffers = jobOfferRepository.findByCompanyId(new ObjectId(companyId));

        if (companyOffers.isEmpty()) {
            System.out.println("Aucune offre trouvée pour l'entreprise : " + companyId);
            return ResponseEntity.ok(Collections.emptyMap());
        }

        Set<String> companyOfferIds = companyOffers.stream()
                .map(offer -> offer.getId().toString())
                .collect(Collectors.toSet());

        List<SwipedCard> swipes = swipedCardRepository.findAll();

        Map<String, Map<String, Integer>> swipeCounts = new HashMap<>();

        for (SwipedCard swipe : swipes) {
            if (companyOfferIds.contains(swipe.getSwipedId())) {
                String swiperId = swipe.getSwiperId();

                swipeCounts.putIfAbsent(swiperId, new HashMap<>());
                swipeCounts.get(swiperId).putIfAbsent("left", 0);
                swipeCounts.get(swiperId).putIfAbsent("right", 0);

                if ("left".equals(swipe.getDirection())) {
                    swipeCounts.get(swiperId).put("left", swipeCounts.get(swiperId).get("left") + 1);
                } else if ("right".equals(swipe.getDirection())) {
                    swipeCounts.get(swiperId).put("right", swipeCounts.get(swiperId).get("right") + 1);
                }
            }
        }

        System.out.println("Nombre de swipes trouvés pour chaque candidat : " + swipeCounts);
        return ResponseEntity.ok(swipeCounts);
    }

    @GetMapping("/{swiperId}/{jobOfferId}")
    public ResponseEntity<?> getSwipedCardsForOffer(
            @PathVariable String swiperId,
            @PathVariable String jobOfferId) {

        if (swiperId == null || swiperId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("L'identifiant de l'utilisateur est requis.");
        }
        if (jobOfferId == null || jobOfferId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("L'identifiant de l'offre est requis.");
        }

        List<SwipedCard> swipedCards = swipedCardRepository.findBySwiperIdAndJobOfferId(swiperId, jobOfferId);
        return ResponseEntity.ok(swipedCards);
    }

    @GetMapping("/{swiperId}")
    public ResponseEntity<?> getSwipedCards(@PathVariable String swiperId) {
        if (swiperId == null || swiperId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("swiperId est requis.");
        }

        List<SwipedCard> swipedCards = swipedCardRepository.findBySwiperId(swiperId);
        System.out.println("Swipes trouvés pour " + swiperId + " : " + swipedCards);
        return ResponseEntity.ok(swipedCards);
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkIfSwiped(
            @RequestParam String swiperId,
            @RequestParam String swipedId,
            @RequestParam String direction,
            @RequestParam(required = false, defaultValue = "") String jobOfferId,
            @RequestParam boolean isFromRedirection) {

        if (swiperId == null || swiperId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("swiperId est requis.");
        }

        if (swipedId == null || swipedId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("swipedId est requis.");
        }

        if (!direction.equals("left") && !direction.equals("right")) {
            return ResponseEntity.badRequest().body("direction doit être 'left' ou 'right'.");
        }

        boolean exists = swipedCardRepository.existsBySwiperIdAndSwipedIdAndDirectionAndJobOfferIdAndIsFromRedirection(
                swiperId, swipedId, direction, jobOfferId, isFromRedirection
        );

        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filteredJobSearchersNormal/{swiperId}")
    public ResponseEntity<?> getFilteredJobSearchersNormal(@PathVariable String swiperId) {
        if (swiperId == null || swiperId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("L'identifiant du swiper est requis.");
        }

        //Récupérer TOUS les swipes (left et right) où jobOfferId est vide et isFromRedirection est false
        List<SwipedCard> swipedCards = swipedCardRepository.findBySwiperIdAndJobOfferIdAndIsFromRedirection(swiperId, "", false);

        //Extraire les `swipedId` des candidats déjà swipés
        List<String> swipedIds = swipedCards.stream()
                .map(SwipedCard::getSwipedId)
                .collect(Collectors.toList());

        //Récupérer tous les job searchers
        List<JobSearcher> jobSearchers = jobSearcherRepository.findAll();

        //Filtrer les candidats déjà swipés (que ce soit left OU right)
        List<JobSearcher> filteredJobSearchers = jobSearchers.stream()
                .filter(jobSearcher -> !swipedIds.contains(jobSearcher.getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredJobSearchers);
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveSwipe(@RequestBody Map<String, Object> payload) {
        String swiperId = (String) payload.get("swiperId");
        String swipedId = (String) payload.get("swipedId");
        String direction = (String) payload.get("direction");
        String jobOfferId = payload.get("jobOfferId") != null ? (String) payload.get("jobOfferId") : "";
        boolean isFromRedirection = payload.containsKey("isFromRedirection") && (boolean) payload.get("isFromRedirection");

        //Vérifier que tous les champs sont valides
        if (swiperId == null || swipedId == null || direction == null) {
            return ResponseEntity.badRequest().body("swiperId, swipedId et direction sont requis.");
        }

        //Vérifier si un swipe exactement identique existe (avec jobOfferId différencié)
        boolean alreadySwiped = swipedCardRepository.existsBySwiperIdAndSwipedIdAndDirectionAndJobOfferIdAndIsFromRedirection(
                swiperId, swipedId, direction, jobOfferId, isFromRedirection
        );

        if (alreadySwiped) {
            return ResponseEntity.ok("Swipe déjà existant pour ce contexte, pas besoin d'ajouter.");
        }

        //Sauvegarde si c'est un nouveau swipe unique
        SwipedCard swipe = new SwipedCard(swiperId, swipedId, direction, jobOfferId, isFromRedirection);
        swipedCardRepository.save(swipe);

        System.out.println("Nouveau swipe enregistré : " + swipe);
        return ResponseEntity.ok("Swipe enregistré !");
    }

}
