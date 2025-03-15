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

    @GetMapping("/filteredJobSearchers/{swiperId}/{jobOfferId}")
    public ResponseEntity<List<JobSearcher>> getFilteredJobSearchers(
            @PathVariable String swiperId,
            @PathVariable String jobOfferId) {

        List<SwipedCard> swipedCards = swipedCardRepository.findBySwiperIdAndJobOfferId(swiperId, jobOfferId);
        List<String> swipedIds = swipedCards.stream()
                .filter(card -> "left".equals(card.getDirection())) // Filtrer uniquement les swipes à gauche
                .map(SwipedCard::getSwipedId)
                .collect(Collectors.toList());

        List<JobSearcher> jobSearchers = jobSearcherRepository.findAll();
        List<JobSearcher> filteredJobSearchers = jobSearchers.stream()
                .filter(jobSearcher -> !swipedIds.contains(jobSearcher.getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredJobSearchers);
    }
    @GetMapping("/{swiperId}/{jobOfferId}")
    public ResponseEntity<List<SwipedCard>> getSwipedCardsForOffer(
            @PathVariable String swiperId,
            @PathVariable String jobOfferId) {

        List<SwipedCard> swipedCards = swipedCardRepository.findBySwiperIdAndJobOfferId(swiperId, jobOfferId);
        return ResponseEntity.ok(swipedCards);
    }


    @GetMapping("/{swiperId}")
    public ResponseEntity<List<SwipedCard>> getSwipedCards(@PathVariable String swiperId) {
        List<SwipedCard> swipedCards = swipedCardRepository.findBySwiperId(swiperId);
        System.out.println("📌 Swipes trouvés pour " + swiperId + " : " + swipedCards);
        return ResponseEntity.ok(swipedCards);
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkIfSwiped(
            @RequestParam String swiperId,
            @RequestParam String swipedId) {

        boolean exists = swipedCardRepository.existsBySwiperIdAndSwipedId(swiperId, swipedId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveSwipe(@RequestBody Map<String, Object> payload) {
        String swiperId = (String) payload.get("swiperId");
        String swipedId = (String) payload.get("swipedId");
        String direction = (String) payload.get("direction");
        String jobOfferId = (String) payload.get("jobOfferId");
        boolean isFromRedirection = payload.containsKey("isFromRedirection") && (boolean) payload.get("isFromRedirection"); // ✅ Ajout

        if (swiperId == null || swipedId == null || direction == null) {
            return ResponseEntity.badRequest().body("❌ swiperId, swipedId et direction sont requis.");
        }

        SwipedCard swipe = new SwipedCard(swiperId, swipedId, direction, jobOfferId, isFromRedirection);
        swipedCardRepository.save(swipe);

        System.out.println("✅ Swipe enregistré : " + swipe);

        return ResponseEntity.ok("✅ Swipe enregistré !");
    }


}
