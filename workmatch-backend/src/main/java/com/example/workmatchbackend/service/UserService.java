package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.User;
import com.example.workmatchbackend.model.Match;
import com.example.workmatchbackend.repository.UserRepository;
import com.example.workmatchbackend.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.workmatchbackend.repository.JobSearcherRepository; // si utilisé
import com.example.workmatchbackend.service.JobOfferService;
import com.example.workmatchbackend.service.SwipeService;

import java.util.List;
import java.util.Optional;
import com.example.workmatchbackend.model.JobOffer;

@Service
public class UserService {
    @Autowired
    private SwipeService swipedCardService;

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }
    @Autowired
    private SwipeService swipeService;

    @Autowired
    private JobOfferService jobOfferService;

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    public Optional<User> getUserByUsername(String username) {
        return Optional.ofNullable(userRepository.findByUsername(username));
    }
    public void deleteUserById(String id) {
        try {
            Optional<User> optionalUser = userRepository.findById(id);
            if (optionalUser.isPresent()) {
                User user = optionalUser.get();

                List<JobOffer> offers = jobOfferService.getJobOffersByCompanyId(id);
                List<String> offerIds = offers.stream().map(JobOffer::getId).toList();

                swipedCardService.deleteAllBySwiperId(id);
                swipedCardService.deleteAllByJobOfferIds(offerIds);

                jobOfferService.deleteAllByCompanyId(user.getId());

                // 🔥 AJOUT ICI : suppression des matchs
                matchRepository.deleteAll(
                        matchRepository.findByIndividualUserIdOrCompanyUserId(id, id)
                );

                userRepository.deleteById(id);
                System.out.println("✅ Utilisateur supprimé avec toutes ses données !");
            }
        } catch (Exception e) {
            System.out.println("❌ Erreur lors de la suppression de l'utilisateur : " + e.getMessage());
            e.printStackTrace(); // 👉 très important pour voir la vraie erreur dans la console
        }
    }

    @Autowired
    private MatchRepository matchRepository;

    public void deleteMatchesByUserId(String userId) {
        List<Match> matchesToDelete = matchRepository.findByIndividualUserIdOrCompanyUserId(userId, userId);

        if (!matchesToDelete.isEmpty()) {
            matchRepository.deleteAll(matchesToDelete);
            System.out.println("🗑️ " + matchesToDelete.size() + " match(s) supprimé(s) pour l'utilisateur " + userId);
        } else {
            System.out.println("⚠️ Aucun match trouvé à supprimer pour l'utilisateur " + userId);
        }
    }

}
