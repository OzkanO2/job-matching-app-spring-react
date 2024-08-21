package com.example.workmatchbackend.repository;

import com.example.workmatchbackend.model.Company;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends MongoRepository<Company, String> {
    Company findByEmail(String email);
    Company findByUsername(String username);
    boolean existsByUniqueNumber(String uniqueNumber); // Requête pour vérifier l'existence d'une entreprise par son numéro unique
    Company findByName(String name);
    Company findByExternalId(String externalId); // Requête pour trouver une entreprise par son ID externe
}
