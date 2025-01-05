package com.example.workmatchbackend.controller;

import com.example.workmatchbackend.model.Settings;
import com.example.workmatchbackend.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/settings")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SettingsController {
    @Autowired
    private SettingsService settingsService;

    @GetMapping
    public List<Settings> getAllSettings() {
        return settingsService.getAllSettings();
    }

    @GetMapping("/{id}")
    public Optional<Settings> getSettingsById(@PathVariable String id) {
        return settingsService.getSettingsById(id);
    }

    @PostMapping
    public Settings createSettings(@RequestBody Settings settings) {
        return settingsService.saveSettings(settings);
    }

    @PutMapping("/{id}")
    public Settings updateSettings(@PathVariable String id, @RequestBody Settings settingsDetails) {
        Optional<Settings> optionalSettings = settingsService.getSettingsById(id);
        if (optionalSettings.isPresent()) {
            Settings settings = optionalSettings.get();
            settings.setDistanceFilter(settingsDetails.getDistanceFilter());
            settings.setNotificationPermission(settingsDetails.isNotificationPermission());
            return settingsService.saveSettings(settings);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteSettings(@PathVariable String id) {
        settingsService.deleteSettings(id);
    }
}
