package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.Like;
import com.example.workmatchbackend.model.User;
import com.example.workmatchbackend.model.JobSearcher;
import com.example.workmatchbackend.repository.LikeRepository;
import com.example.workmatchbackend.repository.UserRepository;
import com.example.workmatchbackend.repository.JobSearcherRepository;
import com.example.workmatchbackend.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class LikeService {
    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobSearcherRepository jobSearcherRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private MatchService matchService;

    public Like saveLike(String swiperId, String swipedId) {
        return saveLike(swiperId, swipedId, null);
    }

    public boolean checkMatch(String user1Id, String user2Id) {
        boolean user1LikedUser2 = likeRepository.existsBySwiperIdAndSwipedId(user1Id, user2Id);
        boolean user2LikedUser1 = likeRepository.existsBySwiperIdAndSwipedId(user2Id, user1Id);

        return user1LikedUser2 && user2LikedUser1;
    }

    public Like saveLike(String swiperId, String swipedId, String companyId) {
        System.out.println("📌 [saveLike] swiperId reçu: " + swiperId);
        System.out.println("📌 [saveLike] swipedId reçu: " + swipedId);
        System.out.println("📌 [saveLike] companyId reçu: " + companyId);

        String foundSwiperId = resolveUserId(swiperId);
        String foundSwipedId = resolveUserId(swipedId);

        if (foundSwiperId == null) {
            throw new RuntimeException("❌ Swiper User not found: " + swiperId);
        }

        System.out.println("📥 foundSwiperId: " + foundSwiperId);
        System.out.println("📥 foundSwipedId: " + foundSwipedId);

        Like like = new Like(foundSwiperId, foundSwipedId, companyId != null ? companyId : "");
        likeRepository.save(like);
        System.out.println("✅ [saveLike] Like enregistré avec ID: " + like.getId());

        matchService.checkAndCreateMatch(foundSwiperId, foundSwipedId, companyId);

        return like;
    }

    private String resolveUserId(String id) {
        Optional<JobSearcher> jobSearcher = jobSearcherRepository.findById(id);
        if (jobSearcher.isPresent()) {
            System.out.println("🔄 Convertir " + id + " en userId " + jobSearcher.get().getUserId());
            return jobSearcher.get().getUserId();
        }
        return id;
    }
}
