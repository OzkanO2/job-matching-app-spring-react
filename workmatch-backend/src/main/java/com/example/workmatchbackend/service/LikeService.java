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
import org.bson.types.ObjectId;

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
        System.out.println("📌 [saveLike] swiperId reçu: " + swiperId);
        System.out.println("📌 [saveLike] swipedId reçu: " + swipedId);
        System.out.println("📌 [saveLike] companyId reçu: " + companyId);

        String foundSwiperId = findUserId(swiperId);

        if (foundSwiperId == null) {
            throw new RuntimeException("❌ Swiper User not found: " + swiperId);
        }
        System.out.println("📥 foundSwiperId trouvé:" + foundSwiperId);

        Like like;
        if (companyId != null) {
            like = new Like(foundSwiperId, swipedId, companyId); // ✅ Cas avec companyId
        } else {
            like = new Like(foundSwiperId, swipedId, ""); // ✅ Ajoute un `""` pour éviter l'erreur
        }

        likeRepository.save(like);
        System.out.println("✅ [saveLike] Like enregistré avec ID: " + like.getId());

        return like;
    }

    private String findUserId(String userId) {

        try {
            System.out.println("🔎 [findUserId] Recherche de l'utilisateur avec ID: " + userId);
            Optional<User> user = userRepository.findById(userId);
            // ✅ Essaye d'abord avec ObjectId
            ObjectId objectId = new ObjectId(userId);

            if (user.isPresent()) {
                System.out.println("✅ Utilisateur trouvé avec ObjectId : " + user.get().getId());
                return user.get().getId();
            }
        } catch (IllegalArgumentException e) {
            // 🚨 Si ce n'est pas un ObjectId, cherche en tant que String
            Optional<User> user = userRepository.findById(userId);
            if (user.isPresent()) {
                System.out.println("✅ Utilisateur trouvé avec String : " + user.get().getId());
                return user.get().getId();
            }
        }

        System.err.println("❌ Utilisateur introuvable pour ID : " + userId);
        return null;
    }
    public boolean checkForMatch(String swiperId, String swipedId) {
        return likeRepository.existsBySwiperIdAndSwipedId(swipedId, swiperId);
    }
}
