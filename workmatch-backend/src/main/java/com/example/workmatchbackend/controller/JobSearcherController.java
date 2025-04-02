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
    public ResponseEntity<?> getMatchingCandidates(@RequestParam String jobOfferId) {
        if (jobOfferId == null || jobOfferId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("L'identifiant de l'offre d'emploi (jobOfferId) est requis.");
        }

        List<JobSearcher> matchingCandidates = jobSearcherService.findMatchingCandidates(jobOfferId);
        return ResponseEntity.ok(matchingCandidates);
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

    @GetMapping("/{userId}")
    public ResponseEntity<?> getJobSearcherByUserId(@PathVariable String userId) {
        Optional<JobSearcher> jobSearcherOptional = jobSearcherService.findByUserId(new ObjectId(userId));

        if (jobSearcherOptional.isPresent()) {
            return ResponseEntity.ok(jobSearcherOptional.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("JobSearcher non trouvé.");
        }
    }

    @PutMapping("/{userId}/updateUser")
    public ResponseEntity<?> updateUser(@PathVariable String userId,
                                        @RequestBody JobSearcher jobSearcher) {
        System.out.println("📥 Requête reçue pour mettre à jour l'utilisateur : " + userId);

        //Vérifier si le JobSearcher existe
        Optional<JobSearcher> existingJobSearcher = jobSearcherService.findByUserId(new ObjectId(userId));
        if (jobSearcher.getSkills() == null || jobSearcher.getSkills().isEmpty()) {
            return ResponseEntity.badRequest().body("Veuillez sélectionner au moins une compétence.");
        }
        if (jobSearcher.getLocations() == null || jobSearcher.getLocations().isEmpty()) {
            return ResponseEntity.badRequest().body("Veuillez sélectionner au moins une ville.");
        }
        if (jobSearcher.getSalaryMin() <= 0 || jobSearcher.getSalaryMax() <= 0) {
            return ResponseEntity.badRequest().body("Les salaires doivent être des nombres positifs.");
        }

        if (jobSearcher.getSalaryMin() >= jobSearcher.getSalaryMax()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Le salaire minimum doit être inférieur au salaire maximum.");
        }
        if (jobSearcher.getEmploymentType() == null || jobSearcher.getEmploymentType().isEmpty()) {
            return ResponseEntity.badRequest().body("Le type de contrat est requis.");
        }
        if (existingJobSearcher.isPresent()) {
            JobSearcher updatedJobSearcher = existingJobSearcher.get();

            //Mise à jour des skills
            updatedJobSearcher.setSkills(jobSearcher.getSkills());

            //Mise à jour du remote (true / false)
            updatedJobSearcher.setRemote(jobSearcher.isRemote());

            //Mise à jour des villes sélectionnées
            updatedJobSearcher.setLocations(jobSearcher.getLocations());

            if (jobSearcher.getSalaryMin() > jobSearcher.getSalaryMax()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Erreur: Le salaire minimum ne peut pas être supérieur au salaire maximum !");
            }
            updatedJobSearcher.setSalaryMin(jobSearcher.getSalaryMin());
            updatedJobSearcher.setSalaryMax(jobSearcher.getSalaryMax());
            updatedJobSearcher.setEmploymentType(jobSearcher.getEmploymentType());

            //Sauvegarde en base de données
            jobSearcherService.saveJobSearcher(updatedJobSearcher);
            System.out.println("Utilisateur mis à jour avec succès !");

            return ResponseEntity.ok(updatedJobSearcher);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé.");
        }
    }
}
