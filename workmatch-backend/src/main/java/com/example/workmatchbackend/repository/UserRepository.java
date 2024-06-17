package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
}
