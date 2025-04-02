package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.User;
import com.example.workmatchbackend.repository.UserRepository;
import com.example.workmatchbackend.repository.JobSearcherRepository;
import com.example.workmatchbackend.service.UserService;
import com.example.workmatchbackend.util.JwtUtil;

import java.util.Arrays;

import com.example.workmatchbackend.model.JobSearcher;
import org.bson.types.ObjectId;
import com.example.workmatchbackend.model.Skill;

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

    @Autowired
    private JobSearcherRepository jobSearcherRepository;

    public UserController(MatchService matchService) {
        this.matchService = matchService;
    }

    @Autowired
    public UserController(UserService userService,
                          JwtUtil jwtUtil,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          LikeService likeService,
                          MatchService matchService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.likeService = likeService;
        this.matchService = matchService;
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

    @PutMapping("/{id}/skills")
    public ResponseEntity<?> updateUserSkills(@PathVariable String id, @RequestBody List<Skill> skills) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();
        user.setSkills(skills); //types compatibles maintenant
        userRepository.save(user);

        return ResponseEntity.ok("Skills updated successfully");
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        userService.deleteUserWithCascade(id);
        return ResponseEntity.ok("Utilisateur supprimé avec cascade.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUserWithCascade(@PathVariable String id) {
        userService.deleteUserWithCascade(id);
        return ResponseEntity.ok("Utilisateur supprimé avec cascade !");
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        Optional<User> userOptional = userService.getUserById(id);

        if (userOptional.isEmpty()) {
            System.out.println("Utilisateur non trouvé !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé");
        }

        User user = userOptional.get();

        System.out.println("Données utilisateur envoyées : " + user.getPreferredCategories());

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
            return ResponseEntity.badRequest().body("swiperId, swipedId et companyId sont requis.");
        }

        System.out.println("Requête reçue avec:");
        System.out.println("swiperId: " + swiperId);
        System.out.println("swipedId: " + swipedId);
        System.out.println("companyId: " + companyId);

        Like like = likeService.saveLike(swiperId, swipedId, companyId);

        return ResponseEntity.ok("Like enregistré: " + like);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        System.out.println("Registering user: " + user.getEmail());
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required.");
        }
        if (user.getUsername().length() < 4 || user.getUsername().length() > 30) {
            return ResponseEntity.badRequest().body("Username must be between 4 and 30 characters.");
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required.");
        }
        if (user.getPassword().length() < 4 || user.getPassword().length() > 50) {
            return ResponseEntity.badRequest().body("Password must be between 4 and 50 characters.");
        }

        if (user.getUserType() == null) {
            return ResponseEntity.badRequest().body("User type is required.");
        }

        //Vérification du format de l'email
        List<String> allowedDomains = Arrays.asList("gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "protonmail.com");
        String email = user.getEmail();
        if (!email.contains("@") || email.split("@").length != 2) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid email format.");
        }

        String domain = email.split("@")[1];
        if (!allowedDomains.contains(domain)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Allowed domains are: " + String.join(", ", allowedDomains));
        }

        //Vérifier si l'email existe déjà
        if (userService.existsByEmail(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already in use.");
        }

        //Hachage du mot de passe
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        //Sauvegarde de l'utilisateur
        User savedUser = userService.saveUser(user);

        //Créer un JobSearcher si l'utilisateur est un INDIVIDUAL
        if (savedUser.getUserType() == UserType.INDIVIDUAL) {
            ObjectId userIdObject;
            try {
                userIdObject = new ObjectId(savedUser.getId()); //Conversion propre de String à ObjectId
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Erreur : Impossible de convertir l'ID utilisateur en ObjectId.");
            }

            JobSearcher jobSearcher = new JobSearcher(
                    userIdObject,
                    savedUser.getUsername(),
                    savedUser.getUsername(),
                    savedUser.getEmail(),
                    new ArrayList<>(),
                    0,
                    0,
                    false,
                    new ArrayList<>()
            );

            jobSearcherRepository.save(jobSearcher);
            System.out.println("JobSearcher créé avec userId: " + userIdObject.toHexString());
        }
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
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Le nom d'utilisateur est requis.");
        }

        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Le mot de passe est requis.");
        }

        if (username.length() > 30) {
            return ResponseEntity.badRequest().body("Le nom d'utilisateur est trop long.");
        }

        if (password.length() > 50) {
            return ResponseEntity.badRequest().body("Le mot de passe est trop long.");
        }

        User existingUser = userRepository.findByUsername(username);
        if (existingUser != null && passwordEncoder.matches(password, existingUser.getPassword())) {
            String token = jwtUtil.generateToken(username);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("userType", existingUser.getUserType().toString());
            response.put("userId", existingUser.getId());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        if (username == null || currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Champs requis manquants.");
        }

        if (newPassword.length() != 4) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Le mot de passe doit contenir exactement 4 caractères.");
        }

        User user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable.");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mot de passe actuel incorrect.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok("Mot de passe mis à jour avec succès.");
    }

    @PostMapping("/like")
    public ResponseEntity<?> likeOffer(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");

        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("swiperId, swipedId et companyId sont requis.");
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

        return ResponseEntity.ok("Successfully logged out");
    }

    @PutMapping("/{userId}/preferences")
    public ResponseEntity<?> updateUserPreferences(@PathVariable String userId, @RequestBody Map<String, List<String>> requestBody) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé");
        }

        User user = userOptional.get();

        if (user.getUserType() == UserType.COMPANY) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Les entreprises ne peuvent pas modifier leurs préférences !");
        }

        List<String> newCategories = requestBody.get("preferredCategories");

        System.out.println("Mise à jour des préférences pour l'utilisateur ID : " + userId);
        System.out.println("Nouvelles catégories avant mise à jour : " + newCategories);

        user.setPreferredCategories(newCategories);
        userRepository.save(user);

        System.out.println("Préférences mises à jour en base !");

        User updatedUser = userRepository.findById(userId).orElse(null);
        System.out.println("Vérification après mise à jour : " + (updatedUser != null ? updatedUser.getPreferredCategories() : "Utilisateur introuvable"));

        return ResponseEntity.ok("Préférences mises à jour avec succès !");
    }
}
