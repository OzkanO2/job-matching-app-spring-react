package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.ChatRoom;
import com.example.workmatchbackend.repository.ChatRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatRoomService {
    @Autowired
    private ChatRoomRepository chatRoomRepository;

    public List<ChatRoom> getAllChatRooms() {
        return chatRoomRepository.findAll();
    }

    public Optional<ChatRoom> getChatRoomById(String id) {
        return chatRoomRepository.findById(id);
    }

    public ChatRoom saveChatRoom(ChatRoom chatRoom) {
        return chatRoomRepository.save(chatRoom);
    }

    public void deleteChatRoom(String id) {
        chatRoomRepository.deleteById(id);
    }
}
