import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // ✅ Ajout d'icônes
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const JobSeekerOnboardingPage = ({ navigation, route }) => {
  const { userInfo } = route.params;

  // Liste des compétences possibles
  const allSkills = ["JavaScript", "React", "Node.js", "Python", "Java", "C#", "Ruby", "Swift"];

  const availableLocations = ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Bordeaux", "Lille", "Nantes"];

  // État pour stocker les compétences sélectionnées et leur expérience
  const [selectedSkills, setSelectedSkills] = useState({});
  const [isRemote, setIsRemote] = useState(false); // ✅ Ajout du remote toggle
  const [selectedLocations, setSelectedLocations] = useState([]); // ✅ Ajout pour les villes

  // Fonction pour ajouter ou retirer une compétence
  const handleSkillToggle = (skill) => {
    setSelectedSkills((prevSkills) => {
      const newSkills = { ...prevSkills };

      if (newSkills[skill]) {
        delete newSkills[skill]; // Retire la compétence si elle est déjà sélectionnée
      } else {
        newSkills[skill] = 1; // Ajoute avec une expérience de 1 an par défaut
      }

      return newSkills;
    });
  };

  // Fonction pour ajuster l'expérience d'une compétence
  const handleExperienceChange = (skill, value) => {
    setSelectedSkills((prevSkills) => ({
      ...prevSkills,
      [skill]: Math.max(1, prevSkills[skill] + value), // Minimum 1 an
    }));
  };

  const handleLocationToggle = (location) => {
    setSelectedLocations((prevLocations) => {
      if (prevLocations.includes(location)) {
        return prevLocations.filter((loc) => loc !== location); // Supprime si déjà sélectionné
      } else {
        return [...prevLocations, location]; // Ajoute si non sélectionné
      }
    });
  };

  // Fonction pour soumettre les données
  const handleSubmit = async () => {
    try {
      if (!userInfo.id) {
        console.error("❌ Erreur : userInfo.id est undefined !");
        alert("User ID is missing. Please try again.");
        return;
      }

      // ✅ Transformation des compétences en JSON correct
      const formattedSkills = Object.entries(selectedSkills).map(([skill, experience]) => ({
        name: skill,
        experience,
      }));

      // ✅ Vérification du JSON avant envoi
      console.log("📤 Envoi des données :", JSON.stringify({
      skills: formattedSkills,
      remote: isRemote,
      locations: selectedLocations // ✅ Envoi des villes sélectionnées
      }));

      const response = await axios.put(
        `http://localhost:8080/jobsearchers/${userInfo.id}/updateUser`, // ✅ Nouveau endpoint
        { skills: formattedSkills,
          remote: isRemote,
          locations: selectedLocations
          }, // ✅ Ajout de remote
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("userToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ User data updated successfully!", response.data);

      await AsyncStorage.setItem("userType", userInfo.userType);
      await AsyncStorage.setItem("userId", userInfo.id);

      if (userInfo.userType === "INDIVIDUAL") {
        navigation.replace("IndividualHome", { userInfo });
      } else if (userInfo.userType === "COMPANY") {
        navigation.replace("CompanyHome", { userInfo });
      }
    } catch (error) {
      console.error("❌ Failed to update user data:", error.response ? error.response.data : error);
      alert("Failed to update user data. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Skills and Experience:</Text>

      <FlatList
        data={allSkills}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.skillContainer}>
            {/* Bouton de sélection de compétence */}
            <TouchableOpacity
              onPress={() => handleSkillToggle(item)}
              style={[styles.skillButton, selectedSkills[item] && styles.selectedSkill]}
            >
              <Text style={[styles.skillText, selectedSkills[item] && styles.selectedSkillText]}>
                {item}
              </Text>
            </TouchableOpacity>

            {/* Sélection de l'expérience si le skill est choisi */}
            {selectedSkills[item] && (
              <View style={styles.experienceContainer}>
                <TouchableOpacity onPress={() => handleExperienceChange(item, -1)}>
                  <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
                </TouchableOpacity>

                <Text style={styles.experienceValue}>{selectedSkills[item]} years</Text>

                <TouchableOpacity onPress={() => handleExperienceChange(item, 1)}>
                  <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* ✅ Toggle Remote Work */}
      <View style={styles.remoteContainer}>
        <Text style={styles.remoteText}>Remote:</Text>
        <TouchableOpacity
          style={[styles.remoteButton, isRemote && styles.remoteSelected]}
          onPress={() => setIsRemote(!isRemote)}
        >
          <Text style={styles.remoteButtonText}>{isRemote ? "YES" : "NO"}</Text>
        </TouchableOpacity>
      </View>

 {/* ✅ Dropdown pour les villes */}
      <Text style={styles.title}>Select Locations:</Text>
      <FlatList
        data={availableLocations}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.locationButton, selectedLocations.includes(item) && styles.selectedLocation]}
            onPress={() => handleLocationToggle(item)}
          >
            <Text style={[styles.locationText, selectedLocations.includes(item) && styles.selectedLocationText]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>SUBMIT</Text>
      </TouchableOpacity>
    </View>
  );
};

// 🎨 **Styles améliorés**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#343a40",
  },
  skillContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  skillButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "#007bff",
    borderRadius: 10,
    backgroundColor: "white",
    marginBottom: 5,
  },
  selectedSkill: {
    backgroundColor: "#007bff",
  },
  skillText: {
    fontSize: 16,
    color: "#007bff",
  },
  selectedSkillText: {
    color: "white",
    fontWeight: "bold",
  },
  experienceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  experienceValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  remoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  remoteText: {
    fontSize: 18,
    marginRight: 10,
  },
  remoteButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#ddd",
  },
  remoteSelected: {
    backgroundColor: "#007bff",
  },
  remoteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  submitButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 15,
  },
  locationButton: {
      padding: 10,
      borderWidth: 2,
      borderColor: "#007bff",
      borderRadius: 10,
      marginVertical: 5,
  },
    selectedLocation: {
    backgroundColor: "#007bff",
  },
  selectedLocationText: {
    color: "white",
    fontWeight: "bold",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default JobSeekerOnboardingPage;
