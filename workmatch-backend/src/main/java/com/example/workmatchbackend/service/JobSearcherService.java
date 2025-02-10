package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobSearcher;
import com.example.workmatchbackend.repository.JobSearcherRepository;
import com.example.workmatchbackend.repository.JobOfferRepository;
import com.example.workmatchbackend.model.JobOffer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.workmatchbackend.model.SkillRequirement;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobSearcherService {

    private final JobSearcherRepository jobSearcherRepository;
    private final JobOfferRepository jobOfferRepository;

    @Autowired
    public JobSearcherService(JobSearcherRepository jobSearcherRepository, JobOfferRepository jobOfferRepository) {
        this.jobSearcherRepository = jobSearcherRepository;
        this.jobOfferRepository = jobOfferRepository;
    }

    // ✅ Méthode qui retourne les job searchers correspondant à une offre
    public List<JobSearcher> findMatchingCandidates(String jobOfferId) {
        Optional<JobOffer> jobOfferOpt = jobOfferRepository.findById(jobOfferId);
        if (jobOfferOpt.isEmpty()) return List.of();

        JobOffer jobOffer = jobOfferOpt.get();

        // ✅ Vérifier que `getSkillsRequired()` retourne bien une `List<SkillRequirement>`
        List<String> requiredSkills = jobOffer.getSkillsRequired()
                .stream()
                .map(SkillRequirement::getName) // 🔹 Assurez-vous que c'est bien une liste d'objets SkillRequirement
                .collect(Collectors.toList());

        return jobSearcherRepository.findAll()
                .stream()
                .filter(js -> js.getSkills()
                        .stream()
                        .filter(skill -> skill instanceof SkillRequirement) // ✅ Vérifier que c'est bien un SkillRequirement
                        .map(skill -> ((SkillRequirement) skill).getName()) // ✅ Convertir correctement
                        .anyMatch(requiredSkills::contains)) // ✅ Vérifier la correspondance
                .collect(Collectors.toList());
    }


    // ✅ Récupère tous les chercheurs d'emploi
    public List<JobSearcher> getAllJobSearchers() {
        return jobSearcherRepository.findAll();
    }

    // ✅ Sauvegarde un chercheur d'emploi
    public JobSearcher saveJobSearcher(JobSearcher jobSearcher) {
        return jobSearcherRepository.save(jobSearcher);
    }
}
