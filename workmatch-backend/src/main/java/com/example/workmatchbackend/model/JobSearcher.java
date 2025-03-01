package com.example.workmatchbackend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import javax.persistence.Transient;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Document(collection = "jobSearchers") // Assurez-vous que le nom de la collection est correct.
public class JobSearcher {
    @Id
    private String id;
    private String name;
    private String email;
    private String username;
    private List<Skill> skills;
    private double experience;
    private String photoUrl;
    private String resumeUrl;
    private String userId;
    private boolean remote;
    private int salaryMin;
    private int salaryMax;
    private List<String> locations;

    @Transient // Ce champ ne sera PAS stocké en base
    @JsonIgnore
    private double matchingScore;

    public int getSalaryMin() {
        return salaryMin;
    }

    public int getSalaryMax() {
        return salaryMax;
    }
    public boolean isRemote() {
        return remote;
    }
    public void setRemote(boolean remote) {
        this.remote = remote;
    }

    public String getUserId() {
        return userId;
    }

    @JsonProperty("matchingScore") // 🔥 S'assure que le score est inclus dans la réponse JSON
    public double getMatchingScore() {
        return matchingScore;
    }


    public void setMatchingScore(double matchingScore) {
        this.matchingScore = matchingScore;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
    public List<Skill> getSkills() { return skills; }
    public void setSkills(List<Skill> skills) { this.skills = skills; }

    public List<String> getLocations() {
        return locations;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public double getExperience() {
        return experience;
    }

    public void setExperience(double experience) {
        this.experience = experience;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }
}
