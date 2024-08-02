package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.Company;
import com.example.workmatchbackend.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/companies")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CompanyController {
    @Autowired
    private CompanyService companyService;

    @GetMapping
    public List<Company> getAllCompanies() {
        return companyService.getAllCompanies();
    }

    @GetMapping("/{id}")
    public Optional<Company> getCompanyById(@PathVariable String id) {
        return companyService.getCompanyById(id);
    }

    @PostMapping
    public Company createCompany(@RequestBody Company company) {
        return companyService.saveCompany(company);
    }

    @PutMapping("/{id}")
    public Company updateCompany(@PathVariable String id, @RequestBody Company companyDetails) {
        Optional<Company> optionalCompany = companyService.getCompanyById(id);
        if (optionalCompany.isPresent()) {
            Company company = optionalCompany.get();
            company.setEmail(companyDetails.getEmail());
            company.setUsername(companyDetails.getUsername());
            company.setPassword(companyDetails.getPassword());
            company.setVerificationCode(companyDetails.getVerificationCode());
            return companyService.saveCompany(company);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteCompany(@PathVariable String id) {
        companyService.deleteCompany(id);
    }
}
