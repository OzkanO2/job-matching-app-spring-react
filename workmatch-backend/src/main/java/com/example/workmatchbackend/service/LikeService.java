package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.Like;
import com.example.workmatchbackend.repository.LikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.workmatchbackend.model.User; // ✅ Import du modèle User
import com.example.workmatchbackend.repository.UserRepository; // ✅ Import du UserRepository
import com.example.workmatchbackend.model.JobSearcher;
import com.example.workmatchbackend.repository.JobSearcherRepository;

@Service
public class LikeService {
    @Autowired
    private JobSearcherRepository jobSearcherRepository;

    @Autowired
    private LikeRepository likeRepository;
    @Autowired
    private UserRepository userRepository; // ✅ Assure-toi que cette ligne est présente

    public Like saveLike(String swiperId, String swipedId) {
        User swiper = userRepository.findById(swiperId)
                .orElseThrow(() -> new RuntimeException("❌ Swiper User not found: " + swiperId));

        JobSearcher swiped = jobSearcherRepository.findById(swipedId)
                .orElseThrow(() -> new RuntimeException("❌ Swiped JobSearcher not found: " + swipedId));

        Like like = new Like(swiperId, swipedId);
        likeRepository.save(like);
        return like; // ✅ Retourne le Like sauvegardé
    }


    public boolean checkForMatch(String swiperId, String swipedId) {
        return likeRepository.existsBySwiperIdAndSwipedId(swipedId, swiperId);
    }
}
