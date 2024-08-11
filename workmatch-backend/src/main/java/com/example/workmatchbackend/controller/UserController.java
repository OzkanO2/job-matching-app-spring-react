package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.User;
import com.example.workmatchbackend.repository.UserRepository;
import com.example.workmatchbackend.service.UserService;
import com.example.workmatchbackend.util.JWTUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.workmatchbackend.model.UserType;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @GetMapping("/id/{id}")
    public Optional<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @PutMapping("/id/{id}")
    public User updateUser(@PathVariable String id, @RequestBody User userDetails) {
        Optional<User> optionalUser = userService.getUserById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setEmail(userDetails.getEmail());
            user.setUsername(userDetails.getUsername());
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            user.setSkills(userDetails.getSkills());
            return userService.saveUser(user);
        }
        return null;
    }

    @PutMapping("/updateUsername")
    public ResponseEntity<?> updateUsername(@RequestBody Map<String, String> updateRequest) {
        String oldUsername = updateRequest.get("oldUsername");
        String newUsername = updateRequest.get("newUsername");

        Optional<User> optionalUser = userRepository.findOptionalByUsername(oldUsername);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setUsername(newUsername);
            userRepository.save(user);  // Mise à jour du nom d'utilisateur dans la base de données

            // Regénérer le token avec le nouveau nom d'utilisateur
            String newToken = jwtUtil.generateToken(newUsername);

            // Retourner le nouveau token au client
            Map<String, String> response = new HashMap<>();
            response.put("token", newToken);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }






    @DeleteMapping("/id/{id}")
    public void deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        System.out.println("Registering user: " + user.getUsername() + ", " + user.getEmail() + ", UserType: " + user.getUserType());

        if (userService.existsByEmail(user.getEmail())) {
            System.out.println("Email already in use: " + user.getEmail());
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already in use");
        }
        if (userService.existsByUsername(user.getUsername())) {
            System.out.println("Username already in use: " + user.getUsername());
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already in use");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Ne redéfinissez pas userType par défaut ici
        System.out.println("UserType: " + user.getUserType());

        User savedUser = userService.saveUser(user);
        System.out.println("User registered successfully: " + savedUser.getUsername() + ", UserType: " + savedUser.getUserType());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }
    @PostMapping("/updateUserType")
    public ResponseEntity<?> updateUserType(@RequestBody User user) {
        System.out.println("Updating user type for user: " + user.getUsername() + " to " + user.getUserType());

        Optional<User> optionalUser = userService.getUserByUsername(user.getUsername());
        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();
            existingUser.setUserType(user.getUserType());
            userService.saveUser(existingUser);
            return ResponseEntity.ok(existingUser);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }




    @GetMapping("/{username}")
    public User getUserInfo(@PathVariable String username) {
        return userRepository.findByUsername(username);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> user) {
        String username = user.get("username");
        String password = user.get("password");

        User existingUser = userRepository.findByUsername(username);
        if (existingUser != null && passwordEncoder.matches(password, existingUser.getPassword())) {
            String token = jwtUtil.generateToken(username);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestBody Map<String, String> tokenMap) {
        String token = tokenMap.get("token");

        // Optionnel : Ajouter le token à une liste de révocation ou à un cache pour le rendre invalide
        // revokeToken(token); // Implémentez cette méthode pour invalider le token (par exemple, stocker dans une base de données)

        return ResponseEntity.ok("Successfully logged out");
    }

}
