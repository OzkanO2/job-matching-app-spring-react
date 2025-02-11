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

    @GetMapping("/filteredJobSearchers/{swiperId}")
    public ResponseEntity<List<JobSearcher>> getFilteredJobSearchers(@PathVariable String swiperId) {
        List<SwipedCard> swipedCards = swipedCardRepository.findBySwiperId(swiperId);
        List<String> swipedIds = swipedCards.stream().map(SwipedCard::getSwipedId).collect(Collectors.toList());

        List<JobSearcher> jobSearchers = jobSearcherRepository.findAll();
        List<JobSearcher> filteredJobSearchers = jobSearchers.stream()
                .filter(jobSearcher -> !swipedIds.contains(jobSearcher.getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredJobSearchers);
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
    public ResponseEntity<String> saveSwipe(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String direction = payload.get("direction");

        if (swiperId == null || swipedId == null || direction == null) {
            return ResponseEntity.badRequest().body("❌ swiperId, swipedId et direction sont requis.");
        }

        if (swipedCardRepository.existsBySwiperIdAndSwipedId(swiperId, swipedId)) {
            return ResponseEntity.ok("⚠️ Swipe déjà enregistré !");
        }

        SwipedCard swipe = new SwipedCard(swiperId, swipedId, direction);
        swipedCardRepository.save(swipe);
        return ResponseEntity.ok("✅ Swipe enregistré !");
    }
}
