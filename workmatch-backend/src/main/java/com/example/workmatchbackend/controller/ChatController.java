package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.Message;
import com.example.workmatchbackend.repository.MessageRepository;
import com.example.workmatchbackend.repository.ConversationRepository;
import com.example.workmatchbackend.model.Conversation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @GetMapping("/{userId}/conversations")
    public ResponseEntity<List<Conversation>> getUserConversations(@PathVariable String userId) {
        List<Conversation> conversations = conversationRepository.findByUser1IdOrUser2Id(userId, userId);
        return ResponseEntity.ok(conversations);
    }

    @SendTo("/topic/messages/{conversationId}")
    @MessageMapping("/send/{conversationId}")
    public void handleChatMessage(@DestinationVariable String conversationId, @Payload Message messageDetails) {
        Message message = new Message(
                messageDetails.getConversationId(),
                messageDetails.getSenderId(),
                messageDetails.getReceiverId(),
                messageDetails.getContent(),
                Instant.now()
        );

        Message savedMessage = messageRepository.save(message);

        // Envoie du message pour le chat
        messagingTemplate.convertAndSend("/topic/messages/" + conversationId, savedMessage);

        // 🔔 Envoie de la notification au receiver
        messagingTemplate.convertAndSend("/topic/notifications/" + savedMessage.getReceiverId(), savedMessage);
    }

    @PostMapping("/sendMessage")
    public ResponseEntity<Message> sendMessage(@RequestBody Message messageDetails) {
        System.out.println("📩 Message reçu via API : " + messageDetails);

        if (messageDetails.getSenderId() == null || messageDetails.getReceiverId() == null) {
            System.out.println("❌ senderId ou receiverId manquant !");
            return ResponseEntity.badRequest().build();
        }

        Message message = new Message(
                messageDetails.getConversationId(),
                messageDetails.getSenderId(),
                messageDetails.getReceiverId(),
                messageDetails.getContent(),
                Instant.now()
        );

        Message savedMessage = messageRepository.save(message);
        System.out.println("✅ Message sauvegardé dans MongoDB : " + savedMessage);

        return ResponseEntity.ok(savedMessage);
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String conversationId) {
        return ResponseEntity.ok(messageRepository.findByConversationId(conversationId));
    }
}
