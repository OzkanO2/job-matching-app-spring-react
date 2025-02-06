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
import com.example.workmatchbackend.repository.ConversationRepository;
import com.example.workmatchbackend.model.Conversation;

@Service
public class MatchService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;
    @Autowired
    private ConversationRepository conversationRepository; // ✅ Injection manquante
    @Autowired
    private JobSearcherRepository jobSearcherRepository;

    public List<Match> getMatchesForUser(String userId) {
        return matchRepository.findByIndividualUserIdOrCompanyUserId(userId, userId);
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
    public boolean checkIfMatchExists(String userId1, String userId2) {
        System.out.println("📌 checkIfMatchExists() appelé !");
        System.out.println("➡️ Vérification du match entre " + userId1 + " et " + userId2);

        boolean matchExists = matchRepository.existsByIndividualUserIdAndCompanyUserId(userId1, userId2) ||
                matchRepository.existsByIndividualUserIdAndCompanyUserId(userId2, userId1);

        System.out.println("📌 Match existe dans la BDD ? " + matchExists);
        return matchExists;
    }


    /**
     * 🔥 Vérification des matchs et création si nécessaire.
     */
    public void checkAndCreateMatch(String swiperId, String swipedId, String companyId) {
        boolean isMutualLike = false;
        String individualUserId = null;
        String companyUserId = null;

        if (companyId == null || companyId.isEmpty()) {
            Optional<Like> mutualLike = likeRepository.findBySwiperIdAndCompanyId(swipedId, swiperId);
            if (mutualLike.isPresent()) {
                isMutualLike = true;
                individualUserId = swipedId;
                companyUserId = swiperId;
            }
        } else {
            Optional<Like> companyLike = likeRepository.findBySwiperIdAndSwipedId(companyId, swiperId);
            if (companyLike.isPresent()) {
                isMutualLike = true;
                individualUserId = swiperId;
                companyUserId = companyId;
            }
        }

        if (isMutualLike) {
            Match match = new Match(individualUserId, companyUserId);
            matchRepository.save(match);
            System.out.println("✅ Match créé entre " + individualUserId + " et " + companyUserId);

            // ✅ Vérifie si une conversation existe déjà avant de la créer
            boolean conversationExists = conversationRepository.existsByUser1IdAndUser2Id(individualUserId, companyUserId)
                    || conversationRepository.existsByUser1IdAndUser2Id(companyUserId, individualUserId);

            if (!conversationExists) {
                Conversation conversation = new Conversation(individualUserId, companyUserId);
                conversationRepository.save(conversation);
                System.out.println("✅ Conversation créée entre " + individualUserId + " et " + companyUserId);
            }
        }

    }
}
