package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.Company;
import com.example.workmatchbackend.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

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
    public ResponseEntity<?> createCompany(@RequestBody Company company) {

        if (companyService.existsByUniqueNumber(company.getUniqueNumber())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Cette entreprise est déjà inscrite avec ce numéro unique.");
        }

        Company savedCompany = companyService.saveCompany(company);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCompany);
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
            company.setCertified(companyDetails.isCertified());
            company.setApiSource(companyDetails.getApiSource());
            company.setExternalId(companyDetails.getExternalId());
            return companyService.saveCompany(company);
        }
        return null;
    }

    @PutMapping("/{id}/certify")
    public ResponseEntity<?> certifyCompany(@PathVariable String id, @RequestParam boolean certified) {
        Optional<Company> optionalCompany = companyService.getCompanyById(id);
        if (optionalCompany.isPresent()) {
            Company company = optionalCompany.get();
            company.setCertified(certified);
            companyService.saveCompany(company);
            return ResponseEntity.ok(company);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Entreprise non trouvée");
    }

    @DeleteMapping("/{id}")
    public void deleteCompany(@PathVariable String id) {
        companyService.deleteCompany(id);
    }
}
