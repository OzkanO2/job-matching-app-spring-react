package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobSearcher;
import com.example.workmatchbackend.repository.JobSearcherRepository;
import com.example.workmatchbackend.repository.JobOfferRepository;
import com.example.workmatchbackend.model.JobOffer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.workmatchbackend.model.Skill;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.persistence.Transient;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Comparator;

@Service
public class JobSearcherService {

    private final JobSearcherRepository jobSearcherRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ObjectMapper objectMapper = new ObjectMapper(); // ✅ Ajoute ici

    @Transient // Ce champ ne sera pas stocké en base
    @JsonIgnore
    private double matchingScore;

    public double getMatchingScore() {
        return matchingScore;
    }
    public void setMatchingScore(double matchingScore) {
        this.matchingScore = matchingScore;
    }
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
                        .map(js -> {
                            double score = calculateMatchingScore(js, jobOffer);
                            js.setMatchingScore(score); // 🔹 Ajout du score de matching
                            return js;
                        })
                        .sorted(Comparator.comparing(JobSearcher::getMatchingScore).reversed()) // 🔹 Tri par score
                        .collect(Collectors.toList());

        System.out.println("✅ Nombre de candidats correspondants : " + matchingCandidates.size());

        matchingCandidates.forEach(js ->
                System.out.println("🟢 Score envoyé pour " + js.getName() + " : " + js.getMatchingScore())
        );
        System.out.println("✅ Nombre de candidats correspondants : " + matchingCandidates.size());
        try {
            System.out.println("✅ Structure JSON envoyée : " + objectMapper.writeValueAsString(matchingCandidates));
        } catch (Exception e) {
            System.out.println("❌ Erreur lors de la conversion JSON : " + e.getMessage());
        }
        matchingCandidates.forEach(js -> {
            js.setMatchingScore(Math.round(js.getMatchingScore() * 100.0) / 100.0);
            System.out.println("🟢 Score final après traitement : " + js.getName() + " - " + js.getMatchingScore() + "%");
        });

        return matchingCandidates;
    }

    private double calculateMatchingScore(JobSearcher jobSearcher, JobOffer jobOffer) {
        double score = 0.0;

        // 🔹 Score basé sur les compétences (40%)
        int totalSkills = jobOffer.getSkills().size();
        double skillsScore = totalSkills > 0
                ? (jobSearcher.getSkills().stream()
                .filter(skill -> jobOffer.getSkills().stream()
                        .anyMatch(reqSkill -> reqSkill.getName().equalsIgnoreCase(skill.getName()) &&
                                skill.getExperience() >= reqSkill.getExperience()))
                .count() / (double) totalSkills)
                : 0.0;
        score += skillsScore * 40;

        // 🔹 Score basé sur la localisation (20%)
        double locationScore = jobSearcher.getLocations().stream()
                .anyMatch(loc -> jobOffer.getLocations().contains(loc)) ? 1.0 : 0.0;
        score += locationScore * 20;

        // 🔹 Score basé sur remote (10%)
        double remoteScore = (jobSearcher.isRemote() == jobOffer.isRemote()) ? 1.0 : 0.0;
        score += remoteScore * 10;

        // 🔹 Score basé sur le salaire (30%)
        double salaryScore = 1.0 - (Math.abs(jobSearcher.getSalaryMin() - jobOffer.getSalaryMin()) / 5000.0);
        salaryScore = Math.max(0, Math.min(1, salaryScore)); // Entre 0 et 1
        score += salaryScore * 30;

        // **🟢 LOG CRUCIAL POUR DEBUG**
        System.out.println("🎯 Calcul Score pour " + jobSearcher.getName() + " => " + score);

        return score;
    }

    private boolean matchesSkills(JobSearcher jobSearcher, List<Skill> requiredSkills) {
        return jobSearcher.getSkills().stream().allMatch(jsSkill ->
                requiredSkills.stream().anyMatch(reqSkill ->
                        jsSkill.getName().equalsIgnoreCase(reqSkill.getName()) &&
                                jsSkill.getExperience() >= reqSkill.getExperience()
                )
        );
    }

    public List<JobSearcher> getAllJobSearchers() {
        return jobSearcherRepository.findAll();
    }

    public JobSearcher saveJobSearcher(JobSearcher jobSearcher) {
        return jobSearcherRepository.save(jobSearcher);
    }

    private double getRequiredExperience(List<String> requiredSkills, String skillName) {
        return requiredSkills.stream()
                .filter(skill -> skill.equalsIgnoreCase(skillName))
                .map(skill -> 2.0)
                .findFirst()
                .orElse(0.0);
    }

    private boolean matchesLocation(JobSearcher jobSearcher, List<String> requiredLocations, boolean isRemote) {
        if (isRemote) return true;
        return jobSearcher.getLocations().stream().anyMatch(requiredLocations::contains);
    }
}
