package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.Like;
import com.example.workmatchbackend.repository.LikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.workmatchbackend.model.User;
import com.example.workmatchbackend.repository.UserRepository;
import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.repository.JobOfferRepository;
import java.util.Optional;

@Service
public class LikeService {
    @Autowired
    private LikeRepository likeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JobOfferRepository jobOfferRepository;

    // ✅ Méthode pour un swipe entre utilisateurs (pas de companyId)
    public Like saveLike(String swiperId, String swipedId) {
        return saveLike(swiperId, swipedId, null);
    }

    // ✅ Méthode pour un swipe sur une offre d’emploi (avec companyId)
    public Like saveLike(String swiperId, String swipedId, String companyId) {
        String foundSwiperId = findUserId(swiperId);
        if (foundSwiperId == null) {
            throw new RuntimeException("❌ Swiper User not found: " + swiperId);
        }

        Like like;
        if (companyId != null) {
            like = new Like(foundSwiperId, swipedId, companyId); // ✅ Cas avec companyId
        } else {
            like = new Like(foundSwiperId, swipedId, ""); // ✅ Ajoute un `""` pour éviter l'erreur
        }

        likeRepository.save(like);
        return like;
    }

    private String findUserId(String userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.map(User::getId).orElse(null);
    }


    public boolean checkForMatch(String swiperId, String swipedId) {
        return likeRepository.existsBySwiperIdAndSwipedId(swipedId, swiperId);
    }
}
