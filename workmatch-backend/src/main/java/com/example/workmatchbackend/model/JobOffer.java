package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.time.LocalDate;

@Document(collection = "jobOffers")
public class JobOffer {

    @Id
    @JsonProperty("_id")
    private String id;

    @NotNull(message = "Title is required")
    private String title;

    @NotNull(message = "Description is required")
    @Size(min = 10, message = "Description should have at least 10 characters")
    private String description;
    private List<String> locations; // ✅ Maintenant une liste

    private String location;
    private double salaryMin;
    private double salaryMax;
    private String category;
    private boolean remote;

    private String url;  // 🔹 Ajouté
    private String apiSource;  // 🔹 Ajouté
    private String externalId;  // 🔹 Ajouté
    private LocalDate createdAt;  // 🔹 Ajouté
    private boolean companyCertified;  // 🔹 Ajouté
    private ObjectId companyId; // 🔹 Assurez-vous que c'est bien un ObjectId

    @NotNull(message = "Employment Type is required")
    private String employmentType; // ✅ Ajout du type d'emploi (Full-time, Part-time, Internship...)

    private List<SkillRequirement> skillsRequired; // ✅ Liste d'objets contenant le skill + expérience requise

    // Constructeur par défaut
    public JobOffer() {}

    public List<String> getLocations() {
        return locations;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public boolean isRemote() {
        return remote;
    }

    public void setRemote(boolean remote) {
        this.remote = remote;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public List<SkillRequirement> getSkillsRequired() {
        return skillsRequired;
    }

    public void setSkillsRequired(List<SkillRequirement> skillsRequired) {
        this.skillsRequired = skillsRequired;
    }

    public ObjectId getCompanyId() {
        return companyId;
    }
    public void setCompanyId(ObjectId companyId) {
        this.companyId = companyId;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
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

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isCompanyCertified() {
        return companyCertified;
    }

    public void setCompanyCertified(boolean companyCertified) {
        this.companyCertified = companyCertified;
    }


}
