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
import org.bson.types.ObjectId;
import java.util.List;
import com.example.workmatchbackend.model.JobOffer;
import java.util.Objects;
import java.util.stream.Collectors;

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

    public Like saveLike(String swiperId, String swipedId, String companyId) {
        return saveLike(swiperId, swipedId, companyId, "", false); // ✅ isFromRedirection = false par défaut
    }
    public boolean checkMatch(String user1Id, String user2Id) {
        boolean user1LikedUser2 = likeRepository.existsBySwiperIdAndSwipedId(user1Id, user2Id);
        boolean user2LikedUser1 = likeRepository.existsBySwiperIdAndSwipedId(user2Id, user1Id);

        return user1LikedUser2 && user2LikedUser1;
    }
    public List<JobOffer> getOffersLikedByUser(String userId) {
        List<Like> likes = likeRepository.findBySwiperId(userId);
        List<String> offerIds = likes.stream()
                .map(Like::getOfferId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        return jobOfferRepository.findAllById(offerIds);
    }

    public Like saveLike(String swiperId, String swipedId, String companyId, String offerId, boolean isFromRedirection) {
        System.out.println("📌 [saveLike] swiperId reçu: " + swiperId);
        System.out.println("📌 [saveLike] swipedId reçu: " + swipedId);
        System.out.println("📌 [saveLike] companyId reçu: " + companyId);
        System.out.println("📌 [saveLike] offerId reçu: " + offerId);
        System.out.println("📌 [saveLike] isFromRedirection: " + isFromRedirection);

        Like like = new Like(swiperId, swipedId, companyId, offerId, isFromRedirection);
        likeRepository.save(like);

        System.out.println("✅ [saveLike] Like enregistré avec ID: " + like.getId());
        matchService.checkAndCreateMatch(swiperId, swipedId, companyId);

        return like;
    }

    private String resolveUserId(String id) {
        Optional<JobSearcher> jobSearcher = jobSearcherRepository.findById(id);
        return jobSearcher.map(js -> js.getUserId().toHexString()).orElse(id); // ✅ Conversion propre
    }

}
