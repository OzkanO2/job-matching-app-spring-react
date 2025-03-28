package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.User;
import com.example.workmatchbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            List<JobOffer> offers = jobOfferService.getJobOffersByCompanyId(id);
            List<String> offerIds = offers.stream().map(JobOffer::getId).toList();

            swipedCardService.deleteAllBySwiperId(id);
            swipedCardService.deleteAllByJobOfferIds(offerIds);

            // ⚠️ Ici on appelle ensuite les suppressions en cascade (qu’on fera à l’étape 2...)
            // Exemple : jobOfferService.deleteAllByCompanyId(user.getId());
            jobOfferService.deleteAllByCompanyId(user.getId());

            userRepository.deleteById(id);
        }
    }

}
