package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    Optional<Conversation> findByUser1IdAndUser2Id(String user1Id, String user2Id);
    boolean existsByUser1IdAndUser2Id(String user1Id, String user2Id);
}
