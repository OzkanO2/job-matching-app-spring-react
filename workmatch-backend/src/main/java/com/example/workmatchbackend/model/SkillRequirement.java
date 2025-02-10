package com.example.workmatchbackend.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class SkillRequirement {
    private String name;
    private double experience; // ✅ Modifier en double

    // Constructeur
    public SkillRequirement(String name, String experience) {
        this.name = name;
        this.experience = parseExperience(experience); // ✅ Convertir ici
    }

    // ✅ Convertir "2 ans" en 2.0 et "2.5 ans" en 2.5
    private double parseExperience(String experience) {
        if (experience == null || experience.isEmpty()) return 0.0;
        return Double.parseDouble(experience.replaceAll("[^\\d.]", ""));
    }

    public String getName() {
        return name;
    }

    public double getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = parseExperience(experience);
    }
}
