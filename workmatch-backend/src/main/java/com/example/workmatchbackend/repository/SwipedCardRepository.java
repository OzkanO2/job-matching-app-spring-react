package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.SwipedCard;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SwipedCardRepository extends MongoRepository<SwipedCard, String> {
    List<SwipedCard> findBySwiperId(String swiperId);
    boolean existsBySwiperIdAndSwipedId(String swiperId, String swipedId);
    boolean existsBySwiperIdAndSwipedIdAndJobOfferId(String swiperId, String swipedId, String jobOfferId);
    List<SwipedCard> findBySwiperIdAndJobOfferId(String swiperId, String jobOfferId);

}
