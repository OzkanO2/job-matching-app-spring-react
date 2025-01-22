package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.JobSearcher;
import com.example.workmatchbackend.service.JobSearcherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/jobsearchers")
public class JobSearcherController {

    @Autowired
    private JobSearcherService jobSearcherService;

    @GetMapping
    public ResponseEntity<List<JobSearcher>> getAllJobSearchers() {
        List<JobSearcher> jobSearchers = jobSearcherService.getAllJobSearchers();
        return ResponseEntity.ok(jobSearchers);
    }

    @PostMapping
    public ResponseEntity<JobSearcher> createJobSearcher(@RequestBody JobSearcher jobSearcher) {
        JobSearcher savedJobSearcher = jobSearcherService.saveJobSearcher(jobSearcher);
        return ResponseEntity.ok(savedJobSearcher);
    }
}
