package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.Like;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends MongoRepository<Like, String> {

    boolean existsBySwiperIdAndSwipedId(String swiperId, String swipedId);  // 🔹 Vérifie les likes entre utilisateurs

    boolean existsBySwiperIdAndOfferId(String swiperId, String offerId);    // 🔹 Vérifie les likes sur une offre
}
