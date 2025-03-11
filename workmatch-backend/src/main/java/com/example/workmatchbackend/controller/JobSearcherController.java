package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.JobSearcher;
import com.example.workmatchbackend.service.JobSearcherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Optional;
import org.bson.types.ObjectId;

import java.util.List;

@RestController
@RequestMapping("/jobsearchers")
@CrossOrigin(origins = "http://localhost:8081")
public class JobSearcherController {

    @Autowired
    private JobSearcherService jobSearcherService;

    public JobSearcherController(JobSearcherService jobSearcherService) {
        this.jobSearcherService = jobSearcherService;
    }

    @GetMapping
    public ResponseEntity<List<JobSearcher>> getAllJobSearchers() {
        List<JobSearcher> jobSearchers = jobSearcherService.getAllJobSearchers();
        return ResponseEntity.ok(jobSearchers);
    }

    @GetMapping("/matching")
    public List<JobSearcher> getMatchingCandidates(@RequestParam String jobOfferId) {
        return jobSearcherService.findMatchingCandidates(jobOfferId);
    }

    @PostMapping
    public ResponseEntity<JobSearcher> createJobSearcher(@RequestBody JobSearcher jobSearcher) {
        JobSearcher savedJobSearcher = jobSearcherService.saveJobSearcher(jobSearcher);
        return ResponseEntity.ok(savedJobSearcher);
    }
    @GetMapping("/matching/company")
    public List<JobSearcher> getMatchingCandidatesForCompany(@RequestParam String companyId) {
        return jobSearcherService.findMatchingCandidatesForCompany(companyId);
    }

    @PutMapping("/{userId}/updateUser")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody JobSearcher jobSearcher) {
        System.out.println("📥 Requête reçue pour mettre à jour les données de " + userId);

        // ✅ Vérifier si le JobSearcher existe avec cet userId
        Optional<JobSearcher> existingJobSearcher = jobSearcherService.findByUserId(new ObjectId(userId));

        if (existingJobSearcher.isPresent()) {
            JobSearcher updatedJobSearcher = existingJobSearcher.get();
            updatedJobSearcher.setSkills(jobSearcher.getSkills());
            updatedJobSearcher.setRemote(jobSearcher.isRemote()); // ✅ Ajout de isRemote

            jobSearcherService.saveJobSearcher(updatedJobSearcher);
            System.out.println("✅ Données utilisateur mises à jour avec succès !");

            return ResponseEntity.ok(updatedJobSearcher);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé.");
        }
    }

}
