package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.Message;
import com.example.workmatchbackend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private MessageService messageService;

    // 🔴 Récupérer les messages d'une conversation
    @GetMapping("/{conversationId}/messages")
    public List<Message> getMessages(@PathVariable String conversationId) {
        return messageService.getMessagesByConversationId(conversationId);
    }

    // 🔵 Envoyer un message (via WebSocket)
    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public Message sendMessage(@RequestBody Message message) {
        return messageService.saveMessage(message);
    }
}
