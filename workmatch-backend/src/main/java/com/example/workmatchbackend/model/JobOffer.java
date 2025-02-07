package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import org.springframework.data.mongodb.core.mapping.DBRef;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty;

@Document(collection = "jobOffers")
public class JobOffer {
    @Id
    @JsonProperty("_id")
    private String id;

    @NotNull(message = "Title is required")
    private String title; // Nouveau champ pour le titre
    @NotNull(message = "Description is required")
    @Size(min = 10, message = "Description should have at least 10 characters")
    private String description;
    private String location;
    private double salaryMin;
    private double salaryMax;
    private String url;
    private String apiSource;
    private String externalId;
    private String category;
    private String employmentType;
    private boolean remote;
    private LocalDate createdAt;
    private boolean companyCertified;
    private String companyId; // Assurez-vous que cet attribut existe bien
    public boolean isCompanyCertified() {
        return companyCertified;
    }
    public String getId() {
        return id;
    }

    public void setCompanyCertified(boolean companyCertified) {
        this.companyCertified = companyCertified;
    }

    // Getters et setters pour les nouveaux attributs
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // Getters et setters existants
    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public double getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(double salaryMin) {
        this.salaryMin = salaryMin;
    }

    public double getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(double salaryMax) {
        this.salaryMax = salaryMax;
    }

    @DBRef // Utilisez cette annotation si vous voulez référencer une entité dans MongoDB
    private Company company;

    // Getter et Setter
    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getApiSource() {
        return apiSource;
    }

    public void setApiSource(String apiSource) {
        this.apiSource = apiSource;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public boolean isRemote() {
        return remote;
    }

    public void setRemote(boolean remote) {
        this.remote = remote;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }
    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }
}
