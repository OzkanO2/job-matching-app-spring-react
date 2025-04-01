package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    Optional<Conversation> findByUser1IdAndUser2Id(String user1Id, String user2Id);

    boolean existsByUser1IdAndUser2Id(String user1Id, String user2Id);

    List<Conversation> findByUser1IdOrUser2Id(String user1Id, String user2Id);
}
