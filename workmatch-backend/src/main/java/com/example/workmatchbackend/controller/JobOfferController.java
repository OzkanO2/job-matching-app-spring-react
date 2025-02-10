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
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Map;
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

    @GetMapping
    public List<JobOffer> getAllJobOffers() {
        logger.info("Fetching all job offers from the database.");
        return jobOfferService.getAllJobOffers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOffer> getJobOfferById(@PathVariable String id) {
        logger.info("Fetching job offer with ID: {}", id);
        Optional<JobOffer> jobOffer = jobOfferService.getJobOfferById(id);
        return jobOffer.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<JobOffer> createJobOffer(@RequestBody JobOffer jobOffer) {
        logger.info("Creating a new job offer.");
        JobOffer savedJobOffer = jobOfferService.saveJobOffer(jobOffer);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedJobOffer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJobOffer(@PathVariable String id) {
        logger.info("Deleting job offer with ID: {}", id);
        jobOfferService.deleteJobOffer(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/like")
    public ResponseEntity<?> likeOffer(@RequestBody Map<String, String> payload) {
        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");

        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.badRequest().body("❌ swiperId, swipedId et companyId sont requis.");
        }

        Like savedLike = likeService.saveLike(swiperId, swipedId, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLike);
    }

    @GetMapping("/matches")
    public ResponseEntity<List<Match>> getMatchesForUser(@RequestParam String userId) {
        List<Match> matches = matchService.getMatchesForUser(userId);
        return ResponseEntity.ok(matches);
    }

    @PostMapping("/match/save")
    public ResponseEntity<String> saveMatch(@RequestBody Match match) {
        matchService.saveMatch(match.getIndividualUserId(), match.getCompanyUserId(), match.getJobOfferId());
        return ResponseEntity.ok("✅ Match enregistré avec succès.");
    }
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobOffer>> getJobOffersByCompany(@PathVariable String companyId) {
        logger.info("📌 Requête reçue pour récupérer les offres de l'entreprise avec companyId: {}", companyId);

        List<JobOffer> jobOffers = jobOfferService.getJobOffersByCompanyId(companyId);

        if (jobOffers.isEmpty()) {
            logger.warn("⚠️ Aucune offre trouvée pour companyId: {}", companyId);
        } else {
            logger.info("✅ {} offres trouvées pour companyId: {}", jobOffers.size(), companyId);
        }

        return ResponseEntity.ok(jobOffers);
    }

    @PostMapping("/match/create")
    public ResponseEntity<?> createMatch(@RequestBody Match match) {
        logger.info("Creating a new match.");
        matchService.saveMatch(match.getIndividualUserId(), match.getCompanyUserId(), match.getJobOfferId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
