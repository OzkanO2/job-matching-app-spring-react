package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.SwipedCard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.workmatchbackend.repository.SwipedCardRepository;  // ✅ Bon repository

@Service
public class SwipeService {

    @Autowired
    private SwipedCardRepository swipedCardRepository;  // ✅ Injection correcte

    public void saveSwipe(SwipedCard swipe) {
        boolean exists = swipedCardRepository.existsBySwiperIdAndSwipedIdAndDirectionAndJobOfferId(
                swipe.getSwiperId(),
                swipe.getSwipedId(),
                swipe.getDirection(),
                swipe.getJobOfferId()
        );

        if (!exists) {
            swipedCardRepository.save(swipe);
            System.out.println("✅ Swipe enregistré avec succès !");
        } else {
            System.out.println("🟡 Swipe déjà enregistré pour cette offre.");
        }
    }
}
