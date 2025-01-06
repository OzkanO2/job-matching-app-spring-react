package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.util.List;

@Document(collection = "jobOffers")
public class JobOffer {

    @Id
    private String id; // ID unique généré automatiquement par MongoDB
    private String title; // Renommé "info" en "title" pour plus de clarté
    private List<String> skills; // Renommé "competences" en "skills" pour uniformité
    private String category; // Ajouté pour stocker la catégorie (ex : IT, Finance)
    private String location;
    private String description;
    private Double salaryMin;
    private Double salaryMax;
    private String url; // URL vers l'offre
    private String apiSource; // Source de l'API (Adzuna, Indeed, etc.)
    private String externalId; // ID externe de l'offre dans l'API
    private String info;
    private String competences; // Assurez-vous que le type correspond
    private String tag;

    @DBRef
    private Company company; // Référence à l'objet "Company" (relation MongoDB)

    private boolean companyCertified; // Indique si l'entreprise est certifiée
    private boolean isRemote; // Ajouté : Indique si l'offre est en télétravail
    private String employmentType; // Ajouté : Temps plein, freelance, etc.
    private String createdAt; // Ajouté : Date de création de l'offre (format ISO)

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    // Getters et Setters
    public String getInfo() {
        return info;
    }

    public void setInfo(String info) {
        this.info = info;
    }

    public String getCompetences() {
        return competences;
    }

    public void setCompetences(String competences) {
        this.competences = competences;
    }
    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(Double salaryMin) {
        this.salaryMin = salaryMin;
    }

    public Double getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(Double salaryMax) {
        this.salaryMax = salaryMax;
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

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public boolean isCompanyCertified() {
        return companyCertified;
    }

    public void setCompanyCertified(boolean companyCertified) {
        this.companyCertified = companyCertified;
    }

    public boolean isRemote() {
        return isRemote;
    }

    public void setRemote(boolean remote) {
        isRemote = remote;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
