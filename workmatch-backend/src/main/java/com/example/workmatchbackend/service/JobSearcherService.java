package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.JobSearcher;
import com.example.workmatchbackend.repository.JobSearcherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobSearcherService {

    @Autowired
    private JobSearcherRepository jobSearcherRepository;

    public List<JobSearcher> getAllJobSearchers() {
        return jobSearcherRepository.findAll();
    }

    public JobSearcher saveJobSearcher(JobSearcher jobSearcher) {
        return jobSearcherRepository.save(jobSearcher);
    }
}
