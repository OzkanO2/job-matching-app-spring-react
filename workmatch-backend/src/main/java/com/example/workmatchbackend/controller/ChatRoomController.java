package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.ChatRoom;
import com.example.workmatchbackend.service.ChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/chatrooms")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ChatRoomController {
    @Autowired
    private ChatRoomService chatRoomService;

    @GetMapping
    public List<ChatRoom> getAllChatRooms() {
        return chatRoomService.getAllChatRooms();
    }

    @GetMapping("/{id}")
    public Optional<ChatRoom> getChatRoomById(@PathVariable String id) {
        return chatRoomService.getChatRoomById(id);
    }

    @PostMapping
    public ChatRoom createChatRoom(@RequestBody ChatRoom chatRoom) {
        return chatRoomService.saveChatRoom(chatRoom);
    }

    @PutMapping("/{id}")
    public ChatRoom updateChatRoom(@PathVariable String id, @RequestBody ChatRoom chatRoomDetails) {
        Optional<ChatRoom> optionalChatRoom = chatRoomService.getChatRoomById(id);
        if (optionalChatRoom.isPresent()) {
            ChatRoom chatRoom = optionalChatRoom.get();
            chatRoom.setParticipants(chatRoomDetails.getParticipants());
            chatRoom.setMessages(chatRoomDetails.getMessages());
            return chatRoomService.saveChatRoom(chatRoom);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteChatRoom(@PathVariable String id) {
        chatRoomService.deleteChatRoom(id);
    }
}
