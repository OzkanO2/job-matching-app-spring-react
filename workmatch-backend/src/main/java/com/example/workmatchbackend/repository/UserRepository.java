package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import org.springframework.data.mongodb.repository.Query;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);
    User findByUsername(String username);
    Optional<User> findOptionalByUsername(String username);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("{'_id': ?0}")
    Optional<User> findById(String id);
}
