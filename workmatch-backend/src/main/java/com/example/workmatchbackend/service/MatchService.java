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
    private ConversationRepository conversationRepository;
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

    private String resolveUserId(String swipedId) {
        Optional<JobSearcher> jobSearcher = jobSearcherRepository.findById(swipedId);
        return jobSearcher.map(js -> js.getUserId().toHexString()).orElse(swipedId);
    }

    public boolean checkIfMatchExists(String userId1, String userId2) {
        System.out.println("📌 checkIfMatchExists() appelé !");
        System.out.println("➡️ Vérification du match entre " + userId1 + " et " + userId2);

        boolean matchExists = matchRepository.existsByIndividualUserIdAndCompanyUserId(userId1, userId2) ||
                matchRepository.existsByIndividualUserIdAndCompanyUserId(userId2, userId1);

        System.out.println("📌 Match existe dans la BDD ? " + matchExists);
        return matchExists;
    }

    public void checkAndCreateMatch(String swiperId, String swipedId, String companyId) {
        boolean isMutualLike = false;
        String individualUserId = null;
        String companyUserId = null;

        if (companyId == null || companyId.isEmpty()) {
            // 🔍 On regarde si le jobseeker (swipedId) a liké une offre de la company (swiperId)
            List<Like> likesByJobSeeker = likeRepository.findAllBySwiperId(swipedId);
            isMutualLike = likesByJobSeeker.stream()
                    .anyMatch(like -> swiperId.equals(like.getCompanyId())); // match sur companyId

            if (isMutualLike) {
                individualUserId = swipedId;
                companyUserId = swiperId;
            }
        } else {
            // 🔍 Ici on vérifie si la company (companyId) a liké ce jobseeker (swiperId)
            Optional<Like> companyLike = likeRepository.findBySwiperIdAndSwipedId(companyId, swiperId);
            if (companyLike.isPresent()) {
                isMutualLike = true;
                individualUserId = swiperId;
                companyUserId = companyId;
            }
        }

        if (isMutualLike) {
            boolean matchExists = matchRepository.existsByIndividualUserIdAndCompanyUserId(individualUserId, companyUserId) ||
                    matchRepository.existsByIndividualUserIdAndCompanyUserId(companyUserId, individualUserId);

            if (!matchExists) {
                Match match = new Match(individualUserId, companyUserId);
                matchRepository.save(match);
                System.out.println("✅ Match créé entre " + individualUserId + " et " + companyUserId);
            }

            boolean conversationExists = conversationRepository.existsByUser1IdAndUser2Id(individualUserId, companyUserId) ||
                    conversationRepository.existsByUser1IdAndUser2Id(companyUserId, individualUserId);

            if (!conversationExists) {
                Conversation conversation = new Conversation(individualUserId, companyUserId);
                conversationRepository.save(conversation);
                System.out.println("✅ Conversation créée entre " + individualUserId + " et " + companyUserId);
            }
        } else {
            System.out.println("⚠️ Aucun like mutuel détecté entre " + swiperId + " et " + swipedId);
        }
    }

}
