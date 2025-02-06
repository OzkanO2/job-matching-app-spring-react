package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.Conversation;
import com.example.workmatchbackend.repository.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ConversationRepository conversationRepository;

    /**
     * 🔍 Récupérer toutes les conversations d'un utilisateur donné
     */
    @GetMapping("/{userId}")
    public List<Conversation> getUserConversations(@PathVariable String userId) {
        System.out.println("📌 Requête reçue pour récupérer les conversations de l'utilisateur: " + userId);
        return conversationRepository.findByUser1IdOrUser2Id(userId, userId);
    }

    /**
     * ✅ Créer une nouvelle conversation entre deux utilisateurs
     */
    @PostMapping("/create")
    public Conversation createConversation(@RequestBody Conversation conversation) {
        System.out.println("✅ Création d'une nouvelle conversation entre "
                + conversation.getUser1Id() + " et " + conversation.getUser2Id());
        return conversationRepository.save(conversation);
    }

    /**
     * 🔍 Vérifier si une conversation existe déjà entre deux utilisateurs
     */
    @GetMapping("/exists/{user1Id}/{user2Id}")
    public boolean checkConversationExists(@PathVariable String user1Id, @PathVariable String user2Id) {
        boolean exists = conversationRepository.existsByUser1IdAndUser2Id(user1Id, user2Id)
                || conversationRepository.existsByUser1IdAndUser2Id(user2Id, user1Id);
        System.out.println("📌 Vérification d'existence entre " + user1Id + " et " + user2Id + ": " + exists);
        return exists;
    }
}
