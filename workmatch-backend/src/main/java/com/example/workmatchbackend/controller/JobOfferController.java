package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.JobOffer;
import com.example.workmatchbackend.model.User;
import com.example.workmatchbackend.repository.JobOfferRepository;
import com.example.workmatchbackend.repository.UserRepository;
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
import com.example.workmatchbackend.repository.LikeRepository;
import com.example.workmatchbackend.repository.SwipedCardRepository;
import com.example.workmatchbackend.model.SwipedCard;
import java.util.Set;
import java.util.stream.Collectors;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDate;
import org.bson.types.ObjectId;
@RestController
@RequestMapping("/joboffers")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class JobOfferController {

    private static final Logger logger = LoggerFactory.getLogger(JobOfferController.class);

    @Autowired
    private JobOfferService jobOfferService;
    @Autowired
    private SwipedCardRepository swipedCardRepository;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private LikeService likeService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

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

        if (jobOffer.getTitle() == null || jobOffer.getTitle().replaceAll("\\s", "").length() < 7) {
            return ResponseEntity.badRequest().body(null);
        }

        if (jobOffer.getDescription() == null || jobOffer.getDescription().replaceAll("\\s", "").length() < 20) {
            return ResponseEntity.badRequest().body(null);
        }

        if (jobOffer.getSalaryMin() >= jobOffer.getSalaryMax()) {
            return ResponseEntity.badRequest().body(null);
        }

        if (jobOffer.getEmploymentType() == null || jobOffer.getEmploymentType().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        if (jobOffer.getLocations() == null || jobOffer.getLocations().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        if (jobOffer.getSkills() == null || jobOffer.getSkills().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        if (jobOffer.getCreatedAt() == null) {
            jobOffer.setCreatedAt(LocalDate.now());
        }

        JobOffer savedJobOffer = jobOfferService.saveJobOffer(jobOffer);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedJobOffer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJobOffer(@PathVariable String id) {
        logger.info("Deleting job offer and its dependencies for ID: {}", id);

        JobOffer offer = jobOfferRepository.findById(id).orElse(null);
        if (offer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Offre introuvable");
        }

        // 🟢 Ici on récupère bien un ObjectId
        ObjectId companyId = offer.getCompanyId();

        // 🟢 On utilise la méthode du repository qui prend un ObjectId
        long count = jobOfferRepository.countByCompanyId(companyId);

        if (count <= 1) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Impossible de supprimer la dernière offre.");
        }

        jobOfferService.deleteJobOfferAndDependencies(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }



    @PostMapping("/like")
    public ResponseEntity<?> likeOffer(@RequestBody Map<String, String> payload) {
        System.out.println("Requête reçue : " + payload);

        String swiperId = payload.get("swiperId");
        String swipedId = payload.get("swipedId");
        String companyId = payload.get("companyId");

        if (swiperId == null || swipedId == null || companyId == null) {
            return ResponseEntity.badRequest().body("swiperId, swipedId et companyId sont requis.");
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
        return ResponseEntity.ok("Match enregistré avec succès.");
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobOffer>> getJobOffersByCompany(@PathVariable String companyId) {
        logger.info("Requête reçue pour récupérer les offres de l'entreprise avec companyId: {}", companyId);

        List<JobOffer> jobOffers = jobOfferService.getJobOffersByCompanyId(companyId);

        if (jobOffers.isEmpty()) {
            logger.warn("Aucune offre trouvée pour companyId: {}", companyId);
        } else {
            logger.info("{} offres trouvées pour companyId: {}", jobOffers.size(), companyId);
        }

        return ResponseEntity.ok(jobOffers);
    }

    @PostMapping("/match/create")
    public ResponseEntity<?> createMatch(@RequestBody Match match) {
        logger.info("Creating a new match.");
        matchService.saveMatch(match.getIndividualUserId(), match.getCompanyUserId(), match.getJobOfferId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JobOffer>> getJobOffersForUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of());
        }

        User user = userOptional.get();
        List<String> preferredCategories = user.getPreferredCategories();

        List<JobOffer> filteredOffers;

        if (preferredCategories == null || preferredCategories.isEmpty()) {
            filteredOffers = jobOfferRepository.findAll();
        } else {
            filteredOffers = jobOfferRepository.findAll().stream()
                    .filter(offer -> preferredCategories.contains(offer.getCategory()))
                    .collect(Collectors.toList());
        }

        List<SwipedCard> swipes = swipedCardRepository.findBySwiperId(userId);
        Set<String> swipedIds = swipes.stream()
                .map(SwipedCard::getSwipedId)
                .collect(Collectors.toSet());

        List<JobOffer> notSwiped = filteredOffers.stream()
                .filter(offer -> !swipedIds.contains(offer.getId()))
                .collect(Collectors.toList());

        // Pagination
        int start = page * size;
        int end = Math.min(start + size, notSwiped.size());
        if (start >= notSwiped.size()) {
            return ResponseEntity.ok(List.of());
        }

        List<JobOffer> paginatedOffers = notSwiped.subList(start, end);
        return ResponseEntity.ok(paginatedOffers);
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateJobOffer(@PathVariable String id, @RequestBody JobOffer updatedOffer) {
        Optional<JobOffer> existingOfferOpt = jobOfferService.getJobOfferById(id);

        if (existingOfferOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Offre non trouvée.");
        }
        String title = updatedOffer.getTitle() != null ? updatedOffer.getTitle().replaceAll("\\s+", "") : "";
        if (title.length() < 7) {
            return ResponseEntity.badRequest().body("Le titre doit contenir au moins 7 caractères (hors espaces).");
        }

        String description = updatedOffer.getDescription() != null ? updatedOffer.getDescription().replaceAll("\\s+", "") : "";
        if (description.length() < 20) {
            return ResponseEntity.badRequest().body("La description doit contenir au moins 20 caractères (hors espaces).");
        }

        if (updatedOffer.getSalaryMin() >= updatedOffer.getSalaryMax()) {
            return ResponseEntity.badRequest().body("Le salaire minimum doit être inférieur au salaire maximum.");
        }

        List<String> validTypes = List.of("full_time", "part_time", "internship", "freelance");
        if (updatedOffer.getEmploymentType() == null || !validTypes.contains(updatedOffer.getEmploymentType())) {
            return ResponseEntity.badRequest().body("Le type de contrat est invalide.");
        }

        if (updatedOffer.getLocations() == null || updatedOffer.getLocations().isEmpty()) {
            return ResponseEntity.badRequest().body("Veuillez sélectionner au moins une ville.");
        }

        if (updatedOffer.getSkills() == null || updatedOffer.getSkills().isEmpty()) {
            return ResponseEntity.badRequest().body("Veuillez sélectionner au moins une compétence.");
        }

        JobOffer existingOffer = existingOfferOpt.get();
        existingOffer.setTitle(updatedOffer.getTitle());
        existingOffer.setDescription(updatedOffer.getDescription());
        existingOffer.setSalaryMin(updatedOffer.getSalaryMin());
        existingOffer.setSalaryMax(updatedOffer.getSalaryMax());
        existingOffer.setEmploymentType(updatedOffer.getEmploymentType());
        existingOffer.setRemote(updatedOffer.isRemote());
        existingOffer.setCategory(updatedOffer.getCategory());
        existingOffer.setLocations(updatedOffer.getLocations());
        existingOffer.setSkills(updatedOffer.getSkills());

        JobOffer savedOffer = jobOfferService.saveJobOffer(existingOffer);
        return ResponseEntity.ok(savedOffer);
    }

}
