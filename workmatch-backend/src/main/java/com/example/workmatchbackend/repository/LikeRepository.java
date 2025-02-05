package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.Like;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends MongoRepository<Like, String> {

    boolean existsBySwiperIdAndSwipedId(String swiperId, String swipedId);

    boolean existsBySwiperIdAndOfferId(String swiperId, String offerId);

    Optional<Like> findBySwiperIdAndSwipedId(String swiperId, String swipedId);

    @Query("{ 'swiperId': ?0, 'companyId': ?1 }")
    Optional<Like> findBySwiperIdAndCompanyId(String swiperId, String companyId);
}
