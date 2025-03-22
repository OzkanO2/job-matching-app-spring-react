package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.time.LocalDate;
import java.util.ArrayList;
import org.springframework.data.mongodb.core.mapping.Field;

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

    private List<String> locations;

    private double salaryMin;
    private double salaryMax;
    private String category;
    private boolean remote;

    private String url;
    private String apiSource;
    private String externalId;
    private boolean companyCertified;
    private ObjectId companyId;

    @NotNull(message = "Employment Type is required")
    private String employmentType;
    @Field(name = "createdAt")
    private LocalDate createdAt;

    private List<Skill> skills;

    public JobOffer() {}

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
    public List<String> getLocations() { return locations; }
    public void setLocations(List<String> locations) { this.locations = locations; }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
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

    public List<Skill> getSkills() {
        if (skills == null) {
            skills = new ArrayList<>();
        }
        return skills;
    }

    public void setSkills(List<Skill> skills) {
        this.skills = skills;
    }
    @JsonProperty("userId") // 🔥 Cela force la sérialisation correcte en JSON
    public String getCompanyIdAsString() {
        return companyId != null ? companyId.toHexString() : null;
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
