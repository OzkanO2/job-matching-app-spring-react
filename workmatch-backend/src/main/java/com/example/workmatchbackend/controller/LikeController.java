package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.Like;
import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.repository.LikeRepository;
import com.example.workmatchbackend.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/likes")  // Assure-toi que c'est bien "/likes"
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LikeController {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    /**
     * 🔥 Permettre à un utilisateur INDIVIDUAL de liker une offre d'emploi
     */
    @PostMapping("/like")
    public ResponseEntity<String> likeJobOffer(@RequestBody Like like) {
        boolean alreadyLiked = likeRepository.existsBySwiperIdAndSwipedId(like.getSwiperId(), like.getSwipedId());

        if (alreadyLiked) {
            return ResponseEntity.badRequest().body("❌ L'utilisateur a déjà liké cette offre.");
        }

        likeRepository.save(like);
        return ResponseEntity.ok("✅ Offre likée avec succès !");
    }

    /**
     * 🔍 Récupérer toutes les offres likées par un utilisateur INDIVIDUAL
     */
    @GetMapping("/likes/{userId}")
    public ResponseEntity<List<JobOffer>> getLikedJobOffers(@PathVariable String userId) {
        List<String> likedOfferIds = likeRepository.findAllBySwiperId(userId).stream()
                .map(Like::getSwipedId)
                .collect(Collectors.toList());

        List<JobOffer> likedOffers = jobOfferRepository.findAllById(likedOfferIds);

        return ResponseEntity.ok(likedOffers);
    }

    /**
     * 🔍 Vérifier si un utilisateur a déjà liké une offre
     */
    @GetMapping("/check/{userId}/{offerId}")
    public ResponseEntity<Boolean> hasUserLikedOffer(@PathVariable String userId, @PathVariable String offerId) {
        boolean exists = likeRepository.existsBySwiperIdAndSwipedId(userId, offerId);
        return ResponseEntity.ok(exists);
    }
    @GetMapping("/{swiperId}")
    public ResponseEntity<List<Like>> getLikesByUser(@PathVariable String swiperId) {
        // ✅ Correction ici : findAllBySwiperId() au lieu de findBySwiperId()
        List<Like> likes = likeRepository.findAllBySwiperId(swiperId);
        return ResponseEntity.ok(likes);
    }
    /**
     * ❌ Supprimer un like (un utilisateur peut "unliker" une offre)
     */
    @DeleteMapping("/unlike/{userId}/{offerId}")
    public ResponseEntity<String> unlikeJobOffer(@PathVariable String userId, @PathVariable String offerId) {
        likeRepository.deleteBySwiperIdAndSwipedId(userId, offerId);
        return ResponseEntity.ok("✅ Like supprimé avec succès !");
    }
}
