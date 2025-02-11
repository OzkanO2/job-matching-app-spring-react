package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.util.List;

@Document(collection = "joboffersadzuna")
public class JobOfferAdzuna {

    @Id
    private String id;
    private String title;
    private String description;
    private List<String> locations;
    private double salaryMin;
    private double salaryMax;
    private String category;
    private boolean remote;
    private String url;
    private String apiSource;
    private String externalId;
    private LocalDate createdAt;
    private String employmentType;
    private List<Skill> skills;

    public JobOfferAdzuna() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getLocations() { return locations; }
    public void setLocations(List<String> locations) { this.locations = locations; }

    public double getSalaryMin() { return salaryMin; }
    public void setSalaryMin(double salaryMin) { this.salaryMin = salaryMin; }

    public double getSalaryMax() { return salaryMax; }
    public void setSalaryMax(double salaryMax) { this.salaryMax = salaryMax; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isRemote() { return remote; }
    public void setRemote(boolean remote) { this.remote = remote; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getApiSource() { return apiSource; }
    public void setApiSource(String apiSource) { this.apiSource = apiSource; }

    public String getExternalId() { return externalId; }
    public void setExternalId(String externalId) { this.externalId = externalId; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public List<Skill> getSkills() { return skills; }
    public void setSkills(List<Skill> skills) { this.skills = skills; }
}
