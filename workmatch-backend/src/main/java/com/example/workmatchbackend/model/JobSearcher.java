package com.example.workmatchbackend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "jobSearchers") // Assurez-vous que le nom de la collection est correct.
public class JobSearcher {
    @Id
    private String id;
    private String name;
    private String email;
    private String username;
    private List<Skill> skills; // ✅ Stocke bien les compétences sous forme d'objets SkillRequirement
    private double experience;
    private String photoUrl; // Note : CamelCase pour les noms des champs
    private String resumeUrl;
    private String userId; // 🔹 Clé correspondant à un utilisateur dans la collection users
    private boolean remote;
    private int salaryMin;   // ✅ On garde salaryMin et salaryMax
    private int salaryMax;
    private List<String> locations; // ✅ Maintenant une liste

    // ✅ Ajoute les getters et setters nécessaires
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
    public List<Skill> getSkills() { return skills; } // ✅ Correct
    public void setSkills(List<Skill> skills) { this.skills = skills; }

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
