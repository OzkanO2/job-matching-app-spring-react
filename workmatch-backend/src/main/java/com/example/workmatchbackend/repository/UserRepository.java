package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import org.springframework.data.mongodb.repository.Query;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
//    User findByUsername(String username);
    Optional<User> findByEmail(String email);
    User findByUsername(String username); // Méthode existante
    Optional<User> findOptionalByUsername(String username);
    boolean existsByUsername(String username);  // Vérifier l'existence par username
    boolean existsByEmail(String email);        // Vérifier l'existence par email
    @Query("{'_id': ?0}")
    Optional<User> findById(String id); // Pas besoin de @Query
}
