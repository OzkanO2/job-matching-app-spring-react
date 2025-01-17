package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.model.Company;
import com.example.workmatchbackend.service.JobOfferService;
import com.example.workmatchbackend.service.CompanyService;
import com.example.workmatchbackend.service.LikeService;
import com.example.workmatchbackend.service.MatchService;
import com.example.workmatchbackend.model.Like;
import com.example.workmatchbackend.model.Match;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/joboffers")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class JobOfferController {

    private static final Logger logger = LoggerFactory.getLogger(JobOfferController.class);

    @Autowired
    private JobOfferService jobOfferService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private LikeService likeService;

    @Autowired
    private MatchService matchService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ADZUNA_APP_ID}")
    private String appId;

    @Value("${ADZUNA_APP_KEY}")
    private String appKey;

    private boolean remote;
    private String employmentType;

    public boolean isRemote() {
        return remote;
    }

    public void setRemote(boolean remote) {
        this.remote = remote;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }


    private String company;

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    /**
     * Récupère toutes les offres d'emploi dans MongoDB.
     */
    @GetMapping
    public List<JobOffer> getAllJobOffers() {
        logger.info("Fetching all job offers from the database.");
        return jobOfferService.getAllJobOffers();
    }

    /**
     * Récupère une offre d'emploi spécifique par ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobOffer> getJobOfferById(@PathVariable String id) {
        logger.info("Fetching job offer with ID: {}", id);
        Optional<JobOffer> jobOffer = jobOfferService.getJobOfferById(id);
        return jobOffer.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * Crée une nouvelle offre d'emploi.
     */
    @PostMapping
    public ResponseEntity<JobOffer> createJobOffer(@RequestBody JobOffer jobOffer) {
        logger.info("Creating a new job offer.");
        Company company = companyService.getCompanyByName(jobOffer.getCompany().getName());
        jobOffer.setCompanyCertified(company != null && company.isCertified());
        JobOffer savedJobOffer = jobOfferService.saveJobOffer(jobOffer);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedJobOffer);
    }


    /**
     * Met à jour une offre d'emploi existante.
     */
    @PutMapping("/{id}")
    public ResponseEntity<JobOffer> updateJobOffer(@PathVariable String id, @RequestBody JobOffer jobOfferDetails) {
        logger.info("Updating job offer with ID: {}", id);
        Optional<JobOffer> optionalJobOffer = jobOfferService.getJobOfferById(id);
        if (optionalJobOffer.isPresent()) {
            JobOffer jobOffer = optionalJobOffer.get();
            jobOffer.setCompany(jobOfferDetails.getCompany());
            jobOffer.setLocation(jobOfferDetails.getLocation());
            jobOffer.setDescription(jobOfferDetails.getDescription());
            jobOffer.setSalaryMin(jobOfferDetails.getSalaryMin());
            jobOffer.setSalaryMax(jobOfferDetails.getSalaryMax());
            jobOffer.setUrl(jobOfferDetails.getUrl());
            jobOffer.setApiSource(jobOfferDetails.getApiSource());
            jobOffer.setExternalId(jobOfferDetails.getExternalId());
            return ResponseEntity.ok(jobOfferService.saveJobOffer(jobOffer));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    /**
     * Supprime une offre d'emploi par ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJobOffer(@PathVariable String id) {
        logger.info("Deleting job offer with ID: {}", id);
        jobOfferService.deleteJobOffer(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    /**
     * Récupère des offres d'emploi externes depuis l'API Adzuna.
     */
    @GetMapping("/external")
    public ResponseEntity<List<JobOffer>> fetchJobOffers(@RequestParam String location) {
        logger.info("Fetching job offers from Adzuna API for location: {}", location);
        try {
            String url = String.format("https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=%s&app_key=%s&location0=%s", appId, appKey, location);
            AdzunaResponse response = restTemplate.getForObject(url, AdzunaResponse.class);
            return ResponseEntity.ok(response.getResults());
        } catch (Exception e) {
            logger.error("Error fetching job offers from Adzuna API: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Ajoute un "like" à une offre d'emploi.
     */
    @PostMapping("/like")
    public ResponseEntity<Like> likeOffer(@RequestBody Like like) {
        logger.info("Liking a job offer.");
        Like savedLike = likeService.saveLike(like);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLike);
    }

    /**
     * Récupère les "matches" pour un utilisateur donné.
     */
    @GetMapping("/matches/{userId}")
    public ResponseEntity<List<Match>> getMatchesForUser(@PathVariable String userId) {
        logger.info("Fetching matches for user with ID: {}", userId);
        List<Match> matches = matchService.getMatchesForUser(userId);
        return ResponseEntity.ok(matches);
    }

    /**
     * Crée un nouveau "match".
     */
    @PostMapping("/match")
    public ResponseEntity<?> createMatch(@RequestBody Match match) {
        logger.info("Creating a new match.");
        matchService.saveMatch(match);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}

/**
 * Modèle pour la réponse de l'API Adzuna.
 */
class AdzunaResponse {
    private List<JobOffer> results;

    public List<JobOffer> getResults() {
        return results;
    }

    public void setResults(List<JobOffer> results) {
        this.results = results;
    }
}
