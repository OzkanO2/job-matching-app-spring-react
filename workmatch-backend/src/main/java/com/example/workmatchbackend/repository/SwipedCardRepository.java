package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.SwipedCard;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.mongodb.repository.Query;

@Repository
public interface SwipedCardRepository extends MongoRepository<SwipedCard, String> {

    // Récupérer tous les swipes d'un utilisateur
    List<SwipedCard> findBySwiperId(String swiperId);

    // Vérifier si un utilisateur a déjà swipé une personne (peu importe l'offre)
    boolean existsBySwiperIdAndSwipedId(String swiperId, String swipedId);

    // Vérifier si un swipe existe pour une offre spécifique
    boolean existsBySwiperIdAndSwipedIdAndJobOfferId(String swiperId, String swipedId, String jobOfferId);
    List<SwipedCard> findBySwiperIdAndSwipedId(String swiperId, String swipedId);

    // Récupérer tous les swipes pour une offre spécifique
    List<SwipedCard> findBySwiperIdAndJobOfferId(String swiperId, String jobOfferId);
    @Query("{ 'swiperId': ?0, 'jobOfferId': ?1, 'isFromRedirection': ?2 }")
    List<SwipedCard> findBySwiperIdAndJobOfferIdAndIsFromRedirection(String swiperId, String jobOfferId, boolean isFromRedirection);
    List<SwipedCard> findBySwipedIdAndDirection(String swipedId, String direction);
    List<SwipedCard> findBySwiperIdAndJobOfferIdAndDirection(String swiperId, String jobOfferId, String direction);

    List<SwipedCard> findBySwipedIdAndDirectionAndIsFromRedirection(String swipedId, String direction, boolean isFromRedirection);  // ✅ Ajoute cette ligne
    @Query("{ 'swiperId': ?0, 'swipedId': ?1, 'direction': 'left', 'jobOfferId': '', 'isFromRedirection': false }")
    List<SwipedCard> findCompaniesThatSwipedLeft(String companyId, String jobSeekerId);

    // Vérifier un swipe exact (avec direction et offre d'emploi)
    boolean existsBySwiperIdAndSwipedIdAndDirectionAndJobOfferId(String swiperId, String swipedId, String direction, String jobOfferId);
    boolean existsBySwiperIdAndSwipedIdAndDirectionAndJobOfferIdAndIsFromRedirection(
            String swiperId, String swipedId, String direction, String jobOfferId, boolean isFromRedirection
    );
    void deleteBySwiperId(String swiperId);
    void deleteByJobOfferId(String jobOfferId);

}
