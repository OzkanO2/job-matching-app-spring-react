package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobSearcher;
import com.example.workmatchbackend.repository.JobSearcherRepository;
import com.example.workmatchbackend.repository.JobOfferRepository;
import com.example.workmatchbackend.model.JobOffer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.workmatchbackend.model.Skill;

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

    public List<JobSearcher> findMatchingCandidates(String jobOfferId) {
        Optional<JobOffer> jobOfferOpt = jobOfferRepository.findById(jobOfferId);
        if (jobOfferOpt.isEmpty()) {
            System.out.println("❌ Aucune offre trouvée pour l'ID : " + jobOfferId);
            return List.of();
        }
        JobOffer jobOffer = jobOfferOpt.get();
        System.out.println("🔍 Offre trouvée : " + jobOffer.getTitle());

        if (jobOffer.getSkills() == null || jobOffer.getSkills().isEmpty()) {
            System.out.println("⚠️ Aucune compétence requise pour cette offre.");
            return List.of();
        }

        System.out.println("📜 Compétences requises pour l'offre : " + jobOffer.getSkills());

        // ✅ Liste des compétences requises
        List<JobSearcher> matchingCandidates =
                jobSearcherRepository.findAll()
                .stream()
                .filter(js -> js.getSkills() != null)
                .filter(js -> js.getSkills()
                        .stream()
                        .anyMatch(skill -> jobOffer.getSkills()
                                .stream()
                                .anyMatch(reqSkill ->
                                        skill.getName().equalsIgnoreCase(reqSkill.getName()) &&
                                                skill.getExperience() >= reqSkill.getExperience()
                                )
                        )
                )
                .collect(Collectors.toList());
        System.out.println("🔍 Vérification des compétences pour l'offre : " + jobOffer.getTitle());
        System.out.println("Compétences requises : " + jobOffer.getSkills());

        System.out.println("✅ Nombre de candidats correspondants : " + matchingCandidates.size());
        return matchingCandidates;
    }


    private boolean matchesSkills(JobSearcher jobSearcher, List<Skill> requiredSkills) {
        return jobSearcher.getSkills().stream().allMatch(jsSkill ->
                requiredSkills.stream().anyMatch(reqSkill ->
                        jsSkill.getName().equalsIgnoreCase(reqSkill.getName()) &&
                                jsSkill.getExperience() >= reqSkill.getExperience()
                )
        );
    }

    // ✅ Récupère tous les chercheurs d'emploi
    public List<JobSearcher> getAllJobSearchers() {
        return jobSearcherRepository.findAll();
    }

    // ✅ Sauvegarde un chercheur d'emploi
    public JobSearcher saveJobSearcher(JobSearcher jobSearcher) {
        return jobSearcherRepository.save(jobSearcher);
    }

    private double getRequiredExperience(List<String> requiredSkills, String skillName) {
        return requiredSkills.stream()
                .filter(skill -> skill.equalsIgnoreCase(skillName))
                .map(skill -> 2.0) // ⬅️ Remplace par la valeur demandée (ici 2 ans par défaut)
                .findFirst()
                .orElse(0.0);
    }

    private boolean matchesLocation(JobSearcher jobSearcher, List<String> requiredLocations, boolean isRemote) {
        if (isRemote) return true; // Accepte tous les job searchers si remote
        return jobSearcher.getLocations().stream().anyMatch(requiredLocations::contains);
    }
}
