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

import com.example.workmatchbackend.model.JobSearcher;
import com.example.workmatchbackend.repository.JobSearcherRepository;

@RestController
@RequestMapping("/api/swiped")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SwipeController {

    @Autowired
    private SwipedCardRepository swipedCardRepository;

    @Autowired
    private JobSearcherRepository jobSearcherRepository;

    /**
     * 📌 Récupérer les candidats filtrés pour une offre d'emploi spécifique.
     */
    @GetMapping("/filteredJobSearchers/{swiperId}/{jobOfferId}")
    public ResponseEntity<List<JobSearcher>> getFilteredJobSearchers(
            @PathVariable String swiperId,
            @PathVariable String jobOfferId) {

        // Récupérer les swipes "left" pour cette offre
        List<SwipedCard> swipedCards = swipedCardRepository.findBySwiperIdAndJobOfferIdAndDirection(swiperId, jobOfferId, "left");

        // Extraire les `swipedId` (candidats ignorés)
        List<String> swipedIds = swipedCards.stream()
                .map(SwipedCard::getSwipedId)
                .collect(Collectors.toList());

        // Filtrer les job searchers en excluant ceux qui ont été ignorés
        List<JobSearcher> jobSearchers = jobSearcherRepository.findAll();
        List<JobSearcher> filteredJobSearchers = jobSearchers.stream()
                .filter(jobSearcher -> !swipedIds.contains(jobSearcher.getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredJobSearchers);
    }

    /**
     * 📌 Récupérer les swipes pour une offre spécifique.
     */
    @GetMapping("/{swiperId}/{jobOfferId}")
    public ResponseEntity<List<SwipedCard>> getSwipedCardsForOffer(
            @PathVariable String swiperId,
            @PathVariable String jobOfferId) {

        List<SwipedCard> swipedCards = swipedCardRepository.findBySwiperIdAndJobOfferId(swiperId, jobOfferId);
        return ResponseEntity.ok(swipedCards);
    }

    /**
     * 📌 Récupérer tous les swipes d'un utilisateur (toutes offres confondues).
     */
    @GetMapping("/{swiperId}")
    public ResponseEntity<List<SwipedCard>> getSwipedCards(@PathVariable String swiperId) {
        List<SwipedCard> swipedCards = swipedCardRepository.findBySwiperId(swiperId);
        System.out.println("📌 Swipes trouvés pour " + swiperId + " : " + swipedCards);
        return ResponseEntity.ok(swipedCards);
    }

    /**
     * 📌 Vérifier si un swipe existe (peu importe l'offre d'emploi).
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkIfSwiped(
            @RequestParam String swiperId,
            @RequestParam String swipedId,
            @RequestParam String direction,
            @RequestParam(required = false, defaultValue = "") String jobOfferId,
            @RequestParam boolean isFromRedirection) {

        boolean exists = swipedCardRepository.existsBySwiperIdAndSwipedIdAndDirectionAndJobOfferIdAndIsFromRedirection(
                swiperId, swipedId, direction, jobOfferId, isFromRedirection
        );

        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/filteredJobSearchersNormal/{swiperId}")
    public ResponseEntity<List<JobSearcher>> getFilteredJobSearchersNormal(@PathVariable String swiperId) {
        // ✅ Récupérer TOUS les swipes (left et right) où jobOfferId est vide et isFromRedirection est false
        List<SwipedCard> swipedCards = swipedCardRepository.findBySwiperIdAndJobOfferIdAndIsFromRedirection(swiperId, "", false);

        // ✅ Extraire les `swipedId` des candidats déjà swipés
        List<String> swipedIds = swipedCards.stream()
                .map(SwipedCard::getSwipedId)
                .collect(Collectors.toList());

        // ✅ Récupérer tous les job searchers
        List<JobSearcher> jobSearchers = jobSearcherRepository.findAll();

        // ✅ Filtrer les candidats déjà swipés (que ce soit left OU right)
        List<JobSearcher> filteredJobSearchers = jobSearchers.stream()
                .filter(jobSearcher -> !swipedIds.contains(jobSearcher.getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredJobSearchers);
    }

    /**
     * 📌 Enregistrer un swipe (avec gestion de `jobOfferId` et `isFromRedirection`).
     */
    @PostMapping("/save")
    public ResponseEntity<String> saveSwipe(@RequestBody Map<String, Object> payload) {
        String swiperId = (String) payload.get("swiperId");
        String swipedId = (String) payload.get("swipedId");
        String direction = (String) payload.get("direction");
        String jobOfferId = payload.get("jobOfferId") != null ? (String) payload.get("jobOfferId") : "";  // 🔹 Toujours définir une valeur par défaut
        boolean isFromRedirection = payload.containsKey("isFromRedirection") && (boolean) payload.get("isFromRedirection");

        // 🔍 Vérifier que tous les champs sont valides
        if (swiperId == null || swipedId == null || direction == null) {
            return ResponseEntity.badRequest().body("❌ swiperId, swipedId et direction sont requis.");
        }

        // 🔥 Vérifier si un swipe **exactement identique** existe (avec jobOfferId différencié)
        boolean alreadySwiped = swipedCardRepository.existsBySwiperIdAndSwipedIdAndDirectionAndJobOfferIdAndIsFromRedirection(
                swiperId, swipedId, direction, jobOfferId, isFromRedirection
        );

        if (alreadySwiped) {
            return ResponseEntity.ok("🟡 Swipe déjà existant pour ce contexte, pas besoin d'ajouter.");
        }

        // ✅ Sauvegarde si c'est un nouveau swipe unique
        SwipedCard swipe = new SwipedCard(swiperId, swipedId, direction, jobOfferId, isFromRedirection);
        swipedCardRepository.save(swipe);

        System.out.println("✅ Nouveau swipe enregistré : " + swipe);
        return ResponseEntity.ok("✅ Swipe enregistré !");
    }

}
