package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.Individual;
import com.example.workmatchbackend.service.IndividualService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/individuals")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class IndividualController {
    @Autowired
    private IndividualService individualService;

    @GetMapping
    public List<Individual> getAllIndividuals() {
        return individualService.getAllIndividuals();
    }

    @GetMapping("/{id}")
    public Optional<Individual> getIndividualById(@PathVariable String id) {
        return individualService.getIndividualById(id);
    }

    @PostMapping
    public Individual createIndividual(@RequestBody Individual individual) {
        return individualService.saveIndividual(individual);
    }

    @PutMapping("/{id}")
    public Individual updateIndividual(@PathVariable String id, @RequestBody Individual individualDetails) {
        Optional<Individual> optionalIndividual = individualService.getIndividualById(id);
        if (optionalIndividual.isPresent()) {
            Individual individual = optionalIndividual.get();
            individual.setEmail(individualDetails.getEmail());
            individual.setUsername(individualDetails.getUsername());
            individual.setPassword(individualDetails.getPassword());
            individual.setAge(individualDetails.getAge());
            individual.setPhotos(individualDetails.getPhotos());
            return individualService.saveIndividual(individual);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteIndividual(@PathVariable String id) {
        individualService.deleteIndividual(id);
    }
}
