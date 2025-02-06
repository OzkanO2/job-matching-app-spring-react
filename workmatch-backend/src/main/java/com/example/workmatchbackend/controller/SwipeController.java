package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.SwipedCard;
import com.example.workmatchbackend.repository.SwipedCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/swiped")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SwipeController {

    @Autowired
    private SwipedCardRepository swipedCardRepository;

    @PostMapping("/save")
    public ResponseEntity<String> saveSwipe(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String direction = payload.get("direction");

        if (swiperId == null || swipedId == null || direction == null) {
            return ResponseEntity.badRequest().body("❌ swiperId, swipedId et direction sont requis.");
        }

        SwipedCard swipe = new SwipedCard(swiperId, swipedId, direction);
        swipedCardRepository.save(swipe);
        return ResponseEntity.ok("✅ Swipe enregistré !");
    }
}
