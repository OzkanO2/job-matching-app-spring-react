package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "companies")
public class Company {
    @Id
    private String id;
    private String name;  // Ajoutez cette ligne
    private String email;
    private String username;
    private String password;
    private String verificationCode;
    private String uniqueNumber; // Ajoutez ce champ pour stocker le numéro unique de l'entreprise
    private boolean certified; // Nouveau champ pour indiquer si l'entreprise est certifiée

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public String getUniqueNumber() {
        return uniqueNumber;
    }

    public void setUniqueNumber(String uniqueNumber) {
        this.uniqueNumber = uniqueNumber;
    }
    public boolean isCertified() {
        return certified;
    }

    public void setCertified(boolean certified) {
        this.certified = certified;
    }
    public String getName() {
        return name;  // Ajoutez cette méthode getter
    }

    public void setName(String name) {
        this.name = name;  // Ajoutez cette méthode setter
    }
}
