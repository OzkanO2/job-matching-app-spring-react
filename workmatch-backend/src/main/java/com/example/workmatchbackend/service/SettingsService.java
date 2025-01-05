package com.example.workmatchbackend.service;

import com.example.workmatchbackend.model.Settings;
import com.example.workmatchbackend.repository.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SettingsService {
    @Autowired
    private SettingsRepository settingsRepository;

    public List<Settings> getAllSettings() {
        return settingsRepository.findAll();
    }

    public Optional<Settings> getSettingsById(String id) {
        return settingsRepository.findById(id);
    }

    public Settings saveSettings(Settings settings) {
        return settingsRepository.save(settings);
    }

    public void deleteSettings(String id) {
        settingsRepository.deleteById(id);
    }
}
