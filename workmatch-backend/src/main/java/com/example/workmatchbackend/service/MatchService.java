package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.Like;
import com.example.workmatchbackend.model.Match;
import com.example.workmatchbackend.model.JobSearcher;
import com.example.workmatchbackend.repository.LikeRepository;
import com.example.workmatchbackend.repository.MatchRepository;
import com.example.workmatchbackend.repository.JobOfferRepository;
import com.example.workmatchbackend.repository.JobSearcherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MatchService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private JobSearcherRepository jobSearcherRepository;

    public List<Match> getMatchesForUser(String userId) {
        return matchRepository.findBySwiperIdOrSwipedId(userId, userId);
    }
    public void saveMatch(String swiperId, String swipedId, String offerId) {
        Match match = new Match(swiperId, swipedId, offerId);
        matchRepository.save(match);
        System.out.println("✅ Match enregistré entre " + swiperId + " et " + swipedId + " pour l'offre " + offerId);
    }

    /**
     * 🔍 Convertir `swipedId` en `userId` si c'est un `jobSearcher`.
     */
    private String resolveUserId(String swipedId) {
        Optional<JobSearcher> jobSearcher = jobSearcherRepository.findById(swipedId);
        return jobSearcher.map(JobSearcher::getUserId).orElse(swipedId);
    }

    /**
     * 🔥 Vérification des matchs et création si nécessaire.
     */
    public void checkAndCreateMatch(String swiperId, String swipedId, String companyId) {
        boolean isMutualLike = false;
        String offerId = null;

        if (companyId == null || companyId.isEmpty()) {
            // 🔍 Cas 1 : Un COMPANY like un INDIVIDUAL
            Optional<Like> mutualLike = likeRepository.findBySwiperIdAndCompanyId(swipedId, swiperId);
            if (mutualLike.isPresent()) {
                isMutualLike = true;
            }
        } else {
            // 🔍 Cas 2 : Un INDIVIDUAL like une offre
            Optional<Like> companyLike = likeRepository.findBySwiperIdAndSwipedId(companyId, swiperId);

            if (companyLike.isPresent()) {
                isMutualLike = true;
            }
        }

        if (isMutualLike) {
            Match match = new Match(swiperId, swipedId, offerId);
            matchRepository.save(match);
            System.out.println("🔥 Match créé entre " + swiperId + " et " + swipedId);
        }
    }

}
