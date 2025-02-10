package com.example.workmatchbackend.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class SkillRequirement {
    private String name;
    private int experience; // ✅ Assure-toi que ce champ est bien un ENTIER

    // Constructeurs
    public SkillRequirement() {}

    public SkillRequirement(String name, int experience) {
        this.name = name;
        this.experience = experience;
    }

    // Getters et Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getExperience() {
        return experience;
    }

    public void setExperience(int experience) {
        this.experience = experience;
    }
}
