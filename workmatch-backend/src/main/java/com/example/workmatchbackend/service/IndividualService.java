package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.Individual;
import com.example.workmatchbackend.repository.IndividualRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IndividualService {
    @Autowired
    private IndividualRepository individualRepository;

    public List<Individual> getAllIndividuals() {
        return individualRepository.findAll();
    }

    public Optional<Individual> getIndividualById(String id) {
        return individualRepository.findById(id);
    }

    public Individual saveIndividual(Individual individual) {
        return individualRepository.save(individual);
    }

    public void deleteIndividual(String id) {
        individualRepository.deleteById(id);
    }

    public Individual findByEmail(String email) {
        return individualRepository.findByEmail(email);
    }

    public Individual findByUsername(String username) {
        return individualRepository.findByUsername(username);
    }
}
