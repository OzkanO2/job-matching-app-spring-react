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

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/joboffers")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class JobOfferController {

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

    @GetMapping
    public List<JobOffer> getAllJobOffers() {
        return jobOfferService.getAllJobOffers();
    }

    @GetMapping("/{id}")
    public Optional<JobOffer> getJobOfferById(@PathVariable String id) {
        return jobOfferService.getJobOfferById(id);
    }

    @PostMapping
    public JobOffer createJobOffer(@RequestBody JobOffer jobOffer) {
        // Vérifiez si l'entreprise est certifiée
        Company company = companyService.getCompanyByName(jobOffer.getCompany().getName());
        if (company != null) {
            jobOffer.setCompanyCertified(company.isCertified());
        } else {
            jobOffer.setCompanyCertified(false); // Si l'entreprise n'existe pas ou n'est pas trouvée
        }

        return jobOfferService.saveJobOffer(jobOffer);
    }

    @PutMapping("/{id}")
    public JobOffer updateJobOffer(@PathVariable String id, @RequestBody JobOffer jobOfferDetails) {
        Optional<JobOffer> optionalJobOffer = jobOfferService.getJobOfferById(id);
        if (optionalJobOffer.isPresent()) {
            JobOffer jobOffer = optionalJobOffer.get();
            jobOffer.setInfo(jobOfferDetails.getInfo());
            jobOffer.setCompetences(jobOfferDetails.getCompetences());
            jobOffer.setTag(jobOfferDetails.getTag());
            jobOffer.setCompany(jobOfferDetails.getCompany());
            jobOffer.setLocation(jobOfferDetails.getLocation());
            jobOffer.setDescription(jobOfferDetails.getDescription());
            jobOffer.setSalaryMin(jobOfferDetails.getSalaryMin());
            jobOffer.setSalaryMax(jobOfferDetails.getSalaryMax());
            jobOffer.setUrl(jobOfferDetails.getUrl());
            jobOffer.setApiSource(jobOfferDetails.getApiSource());
            jobOffer.setExternalId(jobOfferDetails.getExternalId());
            return jobOfferService.saveJobOffer(jobOffer);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteJobOffer(@PathVariable String id) {
        jobOfferService.deleteJobOffer(id);
    }

    @GetMapping("/external")
    public List<JobOffer> fetchJobOffers(@RequestParam String location) {
        String url = String.format("https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=%s&app_key=%s&location0=%s", appId, appKey, location);
        AdzunaResponse response = restTemplate.getForObject(url, AdzunaResponse.class);
        return response.getResults();
    }

    @PostMapping("/like")
    public ResponseEntity<Like> likeOffer(@RequestBody Like like) {
        Like savedLike = likeService.saveLike(like);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLike);
    }

    @GetMapping("/matches/{userId}")
    public List<Match> getMatchesForUser(@PathVariable String userId) {
        return matchService.getMatchesForUser(userId);
    }

    @PostMapping("/match")
    public ResponseEntity<?> createMatch(@RequestBody Match match) {
        matchService.saveMatch(match);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }
}

class AdzunaResponse {
    private List<JobOffer> results;

    public List<JobOffer> getResults() {
        return results;
    }

    public void setResults(List<JobOffer> results) {
        this.results = results;
    }
}
