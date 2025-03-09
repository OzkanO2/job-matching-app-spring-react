package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.User;
import com.example.workmatchbackend.repository.UserRepository;
import com.example.workmatchbackend.service.UserService;
import com.example.workmatchbackend.util.JwtUtil;
import java.util.Arrays;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.workmatchbackend.model.UserType;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.workmatchbackend.model.Like;
import com.example.workmatchbackend.model.Match;
import com.example.workmatchbackend.service.LikeService;
import com.example.workmatchbackend.service.MatchService;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UserController {

    @Autowired
    private LikeService likeService;

    @Autowired
    private MatchService matchService;

    public UserController(MatchService matchService) {
        this.matchService = matchService;
    }
    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

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
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        Optional<User> userOptional = userService.getUserById(id);

        if (userOptional.isEmpty()) {
            System.out.println("❌ Utilisateur non trouvé !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé");
        }

        User user = userOptional.get();

        System.out.println("📡 Données utilisateur envoyées : " + user.getPreferredCategories());

        return ResponseEntity.ok(user);
    }


    @GetMapping("/matches")
    public ResponseEntity<List<Match>> getUserMatches(@RequestParam String userId) {
        List<Match> matches = matchService.getMatchesForUser(userId);
        return ResponseEntity.ok(matches);
    }

    @PostMapping("/getUsernames")
    public ResponseEntity<Map<String, String>> getUsernames(@RequestBody Map<String, List<String>> request) {
        List<String> userIds = request.get("userIds");

        Map<String, String> userMap = userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));

        return ResponseEntity.ok(userMap);
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
            userRepository.save(user);

            String newToken = jwtUtil.generateToken(newUsername);

            Map<String, String> response = new HashMap<>();
            response.put("token", newToken);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }



    @PostMapping("/like-job-offer")
    public ResponseEntity<?> likeJobOffer(@RequestBody Map<String, String> payload) {

        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");

        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.badRequest().body("❌ swiperId, swipedId et companyId sont requis.");
        }

        System.out.println("📥 Requête reçue avec:");
        System.out.println("🔹 swiperId: " + swiperId);
        System.out.println("🔹 swipedId: " + swipedId);
        System.out.println("🔹 companyId: " + companyId);

        Like like = likeService.saveLike(swiperId, swipedId, companyId);

        return ResponseEntity.ok("✅ Like enregistré: " + like);
    }

    @DeleteMapping("/id/{id}")
    public void deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
    }
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        System.out.println("Registering user: " + user.getEmail());

        // Liste des domaines autorisés
        List<String> allowedDomains = Arrays.asList("gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "protonmail.com");

        // Vérifier que l'email contient "@"
        String email = user.getEmail();
        if (!email.contains("@")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email must contain '@' symbol.");
        }

        String[] emailParts = email.split("@");
        if (emailParts.length != 2) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid email format.");
        }

        String prefix = emailParts[0];
        String domain = emailParts[1];

        // Vérifier que le préfixe contient uniquement lettres et chiffres
        if (!prefix.matches("^[a-zA-Z0-9]+$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email prefix must contain only letters and numbers.");
        }

        // Vérifier que le préfixe contient au moins 4 lettres et 1 chiffre
        if (!prefix.matches(".*\\d.*") || prefix.replaceAll("[^a-zA-Z]", "").length() < 4) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("The email prefix must contain at least 4 letters and 1 number.");
        }

        // Vérifier que le domaine est autorisé
        if (!allowedDomains.contains(domain)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Allowed domains are: " + String.join(", ", allowedDomains));
        }

        // Vérifier si l'email existe déjà
        if (userService.existsByEmail(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already in use.");
        }

        // Hachage du mot de passe
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Sauvegarde de l'utilisateur
        User savedUser = userService.saveUser(user);

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
    @GetMapping("/checkUsername/{username}")
    public ResponseEntity<?> checkUsername(@PathVariable String username) {
        boolean exists = userService.existsByUsername(username);
        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already taken");
        }
        return ResponseEntity.ok("Username available");
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
            response.put("userType", existingUser.getUserType().toString());
            response.put("userId", existingUser.getId()); // ✅ Ajout de l'ID utilisateur
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/like")
    public ResponseEntity<?> likeOffer(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");

        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ swiperId, swipedId et companyId sont requis.");
        }

        Like savedLike = likeService.saveLike(swiperId, swipedId, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLike);
    }


    @GetMapping("/matches/{userId}")
    public List<Match> getMatchesForUser(@PathVariable String userId) {
        return matchService.getMatchesForUser(userId);
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestBody Map<String, String> tokenMap) {
        String token = tokenMap.get("token");

        // Optionnel : Ajouter le token à une liste de révocation ou à un cache pour le rendre invalide
        // revokeToken(token); // Implémentez cette méthode pour invalider le token (par exemple, stocker dans une base de données)

        return ResponseEntity.ok("Successfully logged out");
    }

    @PutMapping("/{userId}/preferences")
    public ResponseEntity<?> updateUserPreferences(@PathVariable String userId, @RequestBody Map<String, List<String>> requestBody) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé");
        }

        User user = userOptional.get();

        if (user.getUserType() == UserType.COMPANY) { // ✅ Comparaison correcte avec enum
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Les entreprises ne peuvent pas modifier leurs préférences !");
        }

        List<String> newCategories = requestBody.get("preferredCategories");

        System.out.println("📡 Mise à jour des préférences pour l'utilisateur ID : " + userId);
        System.out.println("📂 Nouvelles catégories avant mise à jour : " + newCategories);

        user.setPreferredCategories(newCategories);
        userRepository.save(user);

        System.out.println("✅ Préférences mises à jour en base !");

        User updatedUser = userRepository.findById(userId).orElse(null);
        System.out.println("🔍 Vérification après mise à jour : " + (updatedUser != null ? updatedUser.getPreferredCategories() : "Utilisateur introuvable"));

        return ResponseEntity.ok("Préférences mises à jour avec succès !");
    }

}
