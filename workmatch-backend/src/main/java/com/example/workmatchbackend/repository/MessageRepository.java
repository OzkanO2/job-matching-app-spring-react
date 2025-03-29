package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByConversationId(String conversationId);
    void deleteAllBySenderIdOrReceiverId(String senderId, String receiverId);
    void deleteAllByConversationId(String conversationId);

}