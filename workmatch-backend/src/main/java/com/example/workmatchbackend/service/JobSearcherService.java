package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobSearcher;
import com.example.workmatchbackend.repository.JobSearcherRepository;
import com.example.workmatchbackend.repository.JobOfferRepository;
import com.example.workmatchbackend.model.JobOffer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.workmatchbackend.model.Skill;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.types.ObjectId;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.persistence.Transient;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Comparator;
import com.example.workmatchbackend.repository.LikeRepository;
import com.example.workmatchbackend.model.Like;
import java.util.Set;

@Service
public class JobSearcherService {

    @Autowired
    private final JobSearcherRepository jobSearcherRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final LikeRepository likeRepository;

    @Transient
    @JsonIgnore
    private double matchingScore;

    public double getMatchingScore() {
        return matchingScore;
    }
    public void setMatchingScore(double matchingScore) {
        this.matchingScore = matchingScore;
    }
    @Autowired
    public JobSearcherService(JobSearcherRepository jobSearcherRepository,
                              JobOfferRepository jobOfferRepository,
                              LikeRepository likeRepository) {
        this.jobSearcherRepository = jobSearcherRepository;
        this.jobOfferRepository = jobOfferRepository;
        this.likeRepository = likeRepository;
    }
    public void deleteByUserId(String userId) {
        ObjectId objectId = new ObjectId(userId);
        System.out.println("JobSearcherService.deleteByUserId CALLED for userId: " + objectId);
        jobSearcherRepository.deleteByUserId(objectId);
    }


    public List<JobSearcher> findMatchingCandidates(String jobOfferId) {
        Optional<JobOffer> jobOfferOpt = jobOfferRepository.findById(jobOfferId);
        if (jobOfferOpt.isEmpty()) {
            System.out.println("Aucune offre trouvée pour l'ID : " + jobOfferId);
            return List.of();
        }
        JobOffer jobOffer = jobOfferOpt.get();
        System.out.println("Offre trouvée : " + jobOffer.getTitle());

        if (jobOffer.getSkills() == null || jobOffer.getSkills().isEmpty()) {
            System.out.println("Aucune compétence requise pour cette offre.");
            return List.of();
        }

        System.out.println("Compétences requises pour l'offre : " + jobOffer.getSkills());

        //Récupérer les "likes" associés à l'offre
        List<Like> likedOffers = likeRepository.findBySwipedId(jobOfferId);
        Set<String> likedIds = likedOffers.stream().map(Like::getSwiperId).collect(Collectors.toSet());

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
                            boolean hasLiked = likedIds.contains(js.getId());
                            js.setHasLikedOffer(hasLiked);

                            double score = calculateMatchingScore(js, jobOffer);
                            js.setMatchingScore(score);
                            return js;
                        })
                        .sorted(Comparator.comparing(JobSearcher::isHasLikedOffer).reversed()
                                .thenComparing(JobSearcher::getMatchingScore).reversed())
                        .collect(Collectors.toList());

        System.out.println("Nombre de candidats correspondants : " + matchingCandidates.size());
        matchingCandidates.forEach(js -> System.out.println("Score envoyé pour " + js.getName() + " : " + js.getMatchingScore()));

        return matchingCandidates;
    }

    public List<JobSearcher> findMatchingCandidatesForCompany(String companyId) {
        List<JobOffer> companyOffers = jobOfferRepository.findByCompanyId(new ObjectId(companyId));

        if (companyOffers.isEmpty()) {
            System.out.println("Aucune offre trouvée pour l'entreprise : " + companyId);
            return List.of();
        }

        List<JobSearcher> jobSearchers = jobSearcherRepository.findAll();

        //Récupérer les swipes pour exclure les candidats déjà vus
        List<Like> swipedCandidates = likeRepository.findBySwiperId(companyId);
        Set<String> swipedIds = swipedCandidates.stream()
                .map(Like::getSwipedId)
                .collect(Collectors.toSet());

        for (JobSearcher js : jobSearchers) {
            if (swipedIds.contains(js.getId())) {
                continue;
            }

            double totalScore = 0.0;
            for (JobOffer offer : companyOffers) {
                totalScore += calculateMatchingScore(js, offer);
            }
            double averageScore = totalScore / companyOffers.size();
            js.setMatchingScore(averageScore);
        }

        return jobSearchers.stream()
                .filter(js -> !swipedIds.contains(js.getId()))
                .sorted(Comparator.comparing(JobSearcher::getMatchingScore).reversed())
                .collect(Collectors.toList());
    }


    public List<JobSearcher> findMatchingCandidatesForSingleOffer(String jobOfferId) {
        Optional<JobOffer> jobOfferOpt = jobOfferRepository.findById(jobOfferId);
        if (jobOfferOpt.isEmpty()) {
            System.out.println("Aucune offre trouvée pour l'ID : " + jobOfferId);
            return List.of();
        }
        JobOffer jobOffer = jobOfferOpt.get();
        System.out.println("Offre trouvée : " + jobOffer.getTitle());

        List<JobSearcher> matchingCandidates =
                jobSearcherRepository.findAll()
                        .stream()
                        .filter(js -> js.getSkills() != null)
                        .map(js -> {
                            double score = calculateMatchingScore(js, jobOffer);
                            js.setMatchingScore(score);

                            //Log important pour voir les scores envoyés
                            System.out.println("🟢 Candidat : " + js.getName() + " | Score : " + score + "%");

                            return js;
                        })
                        .sorted(Comparator.comparing(JobSearcher::getMatchingScore).reversed())
                        .collect(Collectors.toList());

        System.out.println("Nombre de candidats trouvés pour l'offre : " + matchingCandidates.size());

        return matchingCandidates;
    }


    private double calculateMatchingScore(JobSearcher jobSearcher, JobOffer jobOffer) {
        double score = 0.0;

        //Score basé sur les compétences (40%)
        int totalSkills = jobOffer.getSkills().size();
        double skillsScore = totalSkills > 0
                ? (jobSearcher.getSkills().stream()
                .filter(skill -> jobOffer.getSkills().stream()
                        .anyMatch(reqSkill -> reqSkill.getName().equalsIgnoreCase(skill.getName()) &&
                                skill.getExperience() >= reqSkill.getExperience()))
                .count() / (double) totalSkills)
                : 0.0;
        score += skillsScore * 40;

        //Score basé sur la localisation (20%)
        double locationScore = jobSearcher.getLocations().stream()
                .anyMatch(loc -> jobOffer.getLocations().contains(loc)) ? 1.0 : 0.0;
        score += locationScore * 20;

        //Score basé sur remote (10%)
        double remoteScore = (jobSearcher.isRemote() == jobOffer.isRemote()) ? 1.0 : 0.0;
        score += remoteScore * 10;

        //Score basé sur le salaire (30%)
        double salaryScore = 1.0 - (Math.abs(jobSearcher.getSalaryMin() - jobOffer.getSalaryMin()) / 5000.0);
        salaryScore = Math.max(0, Math.min(1, salaryScore)); // Entre 0 et 1
        score += salaryScore * 30;

        //LOG CRUCIAL POUR DEBUG
        System.out.println("Calcul Score pour " + jobSearcher.getName() + " => " + score);

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
    public Optional<JobSearcher> findByUserId(ObjectId userId) {
        return jobSearcherRepository.findByUserId(userId);
    }
}
