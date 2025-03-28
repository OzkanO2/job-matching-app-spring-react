package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.SwipedCard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.workmatchbackend.repository.SwipedCardRepository;  // ✅ Bon repository
import java.util.List;
import java.util.stream.Collectors;
import com.example.workmatchbackend.repository.JobOfferRepository;
import com.example.workmatchbackend.model.JobOffer;
import org.bson.types.ObjectId;

@Service
public class SwipeService {

    @Autowired
    private SwipedCardRepository swipedCardRepository;  // ✅ Injection correcte
    @Autowired
    private JobOfferRepository jobOfferRepository;

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
    public void deleteAllBySwiperId(String swiperId) {
        swipedCardRepository.deleteBySwiperId(swiperId);
    }
    public void deleteAllByJobOfferIds(List<String> offerIds) {
        for (String offerId : offerIds) {
            swipedCardRepository.deleteByJobOfferId(offerId); // Swipes faits pour l'offre
            swipedCardRepository.deleteBySwipedId(offerId);   // Swipes où l'offre est la cible
        }
    }

    public void deleteAllSwipesForCompany(String companyId) {
        // Supprimer les swipes faits par l'entreprise
        swipedCardRepository.deleteBySwiperId(companyId);
        ObjectId companyObjectId = new ObjectId(companyId); // Convertir String → ObjectId
        List<JobOffer> offers = jobOfferRepository.findByCompanyId(companyObjectId);
        for (JobOffer offer : offers) {
            swipedCardRepository.deleteByJobOfferId(offer.getId());
        }
    }
    public void deleteSwipesBySwipedId(String swipedId) {
        swipedCardRepository.deleteBySwipedId(swipedId);
    }

}
