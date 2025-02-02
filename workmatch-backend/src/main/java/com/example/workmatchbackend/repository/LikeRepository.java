package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.Like;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LikeRepository extends MongoRepository<Like, String> {
    boolean existsByUserIdAndSwipedUserId(String userId, String swipedUserId);
    boolean existsByUserIdAndOfferId(String userId, String offerId);
}
