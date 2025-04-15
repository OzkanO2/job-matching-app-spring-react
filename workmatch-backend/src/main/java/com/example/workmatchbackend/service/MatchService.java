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
import java.util.Map;
import java.util.HashMap;

import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    public List<Match> getMatchesForUser(String userId) {
        return matchRepository.findByIndividualUserIdOrCompanyUserId(userId, userId);
    }

    public void saveMatch(String swiperId, String swipedId, String offerId) {
        Match match = new Match(swiperId, swipedId, offerId);
        matchRepository.save(match);
        System.out.println("Match enregistré entre " + swiperId + " et " + swipedId + " pour l'offre " + offerId);
    }

    private String resolveUserId(String swipedId) {
        Optional<JobSearcher> jobSearcher = jobSearcherRepository.findById(swipedId);
        return jobSearcher.map(js -> js.getUserId().toHexString()).orElse(swipedId);
    }

    public boolean checkIfMatchExists(String userId1, String userId2) {
        System.out.println("checkIfMatchExists() appelé !");
        System.out.println("Vérification du match entre " + userId1 + " et " + userId2);

        boolean matchExists = matchRepository.existsByIndividualUserIdAndCompanyUserId(userId1, userId2) ||
                matchRepository.existsByIndividualUserIdAndCompanyUserId(userId2, userId1);

        System.out.println("Match existe dans la BDD ? " + matchExists);
        return matchExists;
    }

    public void checkAndCreateMatch(String swiperId, String swipedId, String companyId) {
        boolean isMutualLike = false;
        String individualUserId = null;
        String companyUserId = null;

        if (companyId == null || companyId.isEmpty()) {
            List<Like> likesByJobSeeker = likeRepository.findAllBySwiperId(swipedId);
            isMutualLike = likesByJobSeeker.stream()
                    .anyMatch(like -> swiperId.equals(like.getCompanyId()));

            if (isMutualLike) {
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
            boolean matchExists = matchRepository.existsByIndividualUserIdAndCompanyUserId(individualUserId, companyUserId) ||
                    matchRepository.existsByIndividualUserIdAndCompanyUserId(companyUserId, individualUserId);

            if (!matchExists) {
                Match match = new Match(individualUserId, companyUserId);
                matchRepository.save(match);
                System.out.println("Match créé entre " + individualUserId + " et " + companyUserId);
            }

            boolean conversationExists = conversationRepository.existsByUser1IdAndUser2Id(individualUserId, companyUserId) ||
                    conversationRepository.existsByUser1IdAndUser2Id(companyUserId, individualUserId);

            if (!conversationExists) {
                conversationRepository.save(new Conversation(individualUserId, companyUserId));
                System.out.println("Conversation créée entre " + individualUserId + " et " + companyUserId);
            }

            Map<String, String> notifToIndividual = new HashMap<>();
            notifToIndividual.put("type", "match");
            notifToIndividual.put("message", "Nouveau match !");
            notifToIndividual.put("withUserId", companyUserId);
            notifToIndividual.put("conversationId", individualUserId + "_" + companyUserId);
            notifToIndividual.put("senderId", companyUserId); // L'expéditeur est la company

            Map<String, String> notifToCompany = new HashMap<>();
            notifToCompany.put("type", "match");
            notifToCompany.put("message", "Nouveau match !");
            notifToCompany.put("withUserId", individualUserId);
            notifToCompany.put("conversationId", individualUserId + "_" + companyUserId);
            notifToCompany.put("senderId", individualUserId); // L'expéditeur est l'individu

            messagingTemplate.convertAndSend("/topic/notifications/" + individualUserId, notifToIndividual);
            messagingTemplate.convertAndSend("/topic/notifications/" + companyUserId, notifToCompany);

        } else {
            System.out.println("Aucun like mutuel détecté entre " + swiperId + " et " + swipedId);
        }
    }

    public boolean checkAndCreateMatchAfterCompanyLike(String companyUserId, String candidateUserId) {
        List<Like> candidateLikes = likeRepository.findAllBySwiperId(candidateUserId);

        boolean hasLikedCompany = candidateLikes.stream()
                .anyMatch(like -> like.getCompanyId().equals(companyUserId));

        if (hasLikedCompany) {
            boolean matchExists = matchRepository.existsByIndividualUserIdAndCompanyUserId(candidateUserId, companyUserId);
            if (!matchExists) {
                Match match = new Match(candidateUserId, companyUserId);
                matchRepository.save(match);
                System.out.println("Nouveau match créé entre " + candidateUserId + " et " + companyUserId);

                boolean convExists = conversationRepository.existsByUser1IdAndUser2Id(candidateUserId, companyUserId)
                        || conversationRepository.existsByUser1IdAndUser2Id(companyUserId, candidateUserId);

                if (!convExists) {
                    conversationRepository.save(new Conversation(candidateUserId, companyUserId));
                    System.out.println("Conversation créée !");
                }

                return true;
            }
        }

        System.out.println("Pas encore de like du candidat vers l'entreprise.");
        return false;
    }


}
