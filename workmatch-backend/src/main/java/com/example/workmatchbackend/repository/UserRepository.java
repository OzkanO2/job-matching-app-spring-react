package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    User findByUsername(String username);
    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);  // Vérifier l'existence par username
    boolean existsByEmail(String email);        // Vérifier l'existence par email
}
