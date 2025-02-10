package com.example.workmatchbackend.model;

public class Skill {
    private String name;
    private double experience; // ✅ Changer en double

    public Skill(String name, double experience) {
        this.name = name;
        this.experience = experience;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getExperience() { return experience; }
    public void setExperience(double experience) { this.experience = experience; }
}
