package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.Message;
import com.example.workmatchbackend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;
import com.example.workmatchbackend.model.Message;

@RestController
@RequestMapping("/api/chat")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Message messageDetails) {
        System.out.println("📩 Message reçu : " + messageDetails);

        if (messageDetails.getSenderId() == null || messageDetails.getReceiverId() == null) {
            System.out.println("❌ Erreur : senderId ou receiverId est null");
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
        System.out.println("✅ Message sauvegardé : " + savedMessage);
        return ResponseEntity.ok(savedMessage);
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String conversationId) {
        return ResponseEntity.ok(messageRepository.findByConversationId(conversationId));
    }

    @PostMapping("/sendMessage/{conversationId}")
    public ResponseEntity<Message> handleMessage(@RequestBody Message messageDetails, @PathVariable String conversationId) {
        Message message = new Message();
        message.setConversationId(conversationId);
        message.setSenderId(messageDetails.getSenderId());
        message.setContent(messageDetails.getContent());

        message.setTimestamp(Instant.ofEpochMilli(System.currentTimeMillis()));

        Message savedMessage = messageRepository.save(message);
        return ResponseEntity.ok(savedMessage);
    }
}