package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.Like;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;

@Repository
public interface LikeRepository extends MongoRepository<Like, String> {

    boolean existsBySwiperIdAndSwipedId(String swiperId, String swipedId);

    boolean existsBySwiperIdAndOfferId(String swiperId, String offerId);

    Optional<Like> findBySwiperIdAndSwipedId(String swiperId, String swipedId);
    List<Like> findBySwipedId(String swipedId); // Récupère les likes par swipedId
    List<Like> findBySwiperId(String swiperId);

    List<Like> findAllBySwiperIdAndCompanyId(String swiperId, String companyId);

    List<Like> findAllBySwiperId(String swiperId);

    void deleteBySwiperIdAndSwipedId(String swiperId, String swipedId);
}