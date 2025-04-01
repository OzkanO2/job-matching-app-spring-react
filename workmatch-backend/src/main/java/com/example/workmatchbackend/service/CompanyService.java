package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.Company;
import com.example.workmatchbackend.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public Optional<Company> getCompanyById(String id) {
        return companyRepository.findById(id);
    }

    public Company saveCompany(Company company) {
        return companyRepository.save(company);
    }

    public void deleteCompany(String id) {
        companyRepository.deleteById(id);
    }

    public Company findByEmail(String email) {
        return companyRepository.findByEmail(email);
    }

    public Company findByUsername(String username) {
        return companyRepository.findByUsername(username);
    }

    public boolean existsByUniqueNumber(String uniqueNumber) {
        return companyRepository.existsByUniqueNumber(uniqueNumber);
    }

    public Company getCompanyByName(String name) {
        return companyRepository.findByName(name);
    }

    public boolean isCompanyCertified(String name) {
        Company company = companyRepository.findByName(name);
        return company != null && company.isCertified();
    }

    public Company findByExternalId(String externalId) {
        return companyRepository.findByExternalId(externalId);
    }

    public Company getOrCreateCompany(String companyName) {
        Company company = companyRepository.findByName(companyName);
        if (company == null) {
            company = new Company();
            company.setName(companyName);
            company.setCertified(false);
            return companyRepository.save(company);
        }
        return company;
    }

}
