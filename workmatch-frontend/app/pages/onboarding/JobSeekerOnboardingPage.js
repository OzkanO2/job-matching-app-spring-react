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
  const allSkills = [
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Next.js",
    "Node.js", "Express.js", "Spring Boot", "Django", "Flask", "Ruby on Rails", "PHP", "Laravel",
    "Java", "Python", "C#", "C++", "Go", "Rust", "Kotlin", "Swift", "Ruby",
    "Docker", "Kubernetes", "CI/CD", "Jenkins", "GitLab CI", "Terraform", "Ansible", "AWS", "Azure", "GCP",
    "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "Keras", "PyTorch", "Matplotlib", "Seaborn",
    "CloudFormation", "AWS Lambda", "S3", "EC2", "Cloud Functions", "Firestore",
    "Cybersecurity", "Penetration Testing", "Network Security", "OWASP", "SIEM", "Firewall",
    "SQL", "Power BI", "Excel", "Data Analysis", "Tableau", "UML", "Agile", "Scrum",
    "Git", "GitHub", "Bitbucket", "VS Code", "JIRA", "Postman", "Figma", "Notion"
  ];

  const availableLocations = [
    "Paris, France",
    "Lyon, France",
    "Bruxelles, Belgium",
    "New York, USA",
    "Los Angeles, USA",
    "Toronto, Canada",
    "Montreal, Canada",
    "Bangkok, Thailand",
    "Tokyo, Japan",
    "Berlin, Germany",
    "Lisbon, Portugal",
    "Madrid, Spain",
    "Rome, Italy",
    "Sydney, Australia",
    "Melbourne, Australia"
  ];

  // État pour stocker les compétences sélectionnées et leur expérience
  const [selectedSkills, setSelectedSkills] = useState({});
  const [isRemote, setIsRemote] = useState(false); // Ajout du remote toggle
  const [selectedLocations, setSelectedLocations] = useState([]); // Ajout pour les villes
  const [salaryMin, setSalaryMin] = useState(30000);
  const [salaryMax, setSalaryMax] = useState(60000);
    const [employmentType, setEmploymentType] = useState('');
    const [employmentTypeError, setEmploymentTypeError] = useState('');

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
    const handleSalaryChange = (type, amount) => {
        if (type === "min") {
          setSalaryMin((prev) => Math.max(10000, Math.min(prev + amount, salaryMax - 1000)));
        } else {
          setSalaryMax((prev) => Math.max(salaryMin + 1000, prev + amount));
        }
      };
  // Fonction pour soumettre les données
  const handleSubmit = async () => {
    try {
      if (!userInfo.id) {
        console.error("Erreur : userInfo.id est undefined !");
        alert("User ID is missing. Please try again.");
        return;
      }

      // Transformation des compétences en JSON correct
      const formattedSkills = Object.entries(selectedSkills).map(([skill, experience]) => ({
        name: skill,
        experience,
      }));

      // Vérification du JSON avant envoi
      console.log("Envoi des données :", JSON.stringify({
      skills: formattedSkills,
      remote: isRemote,
      locations: selectedLocations, // Envoi des villes sélectionnées
        salaryMin,
        salaryMax
      }));

      const response = await axios.put(
        `http://localhost:8080/jobsearchers/${userInfo.id}/updateUser`, // Nouveau endpoint
                { skills: formattedSkills, remote: isRemote, locations: selectedLocations, salaryMin, salaryMax,
  employmentType, },

        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("userToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("User data updated successfully!", response.data);

      await AsyncStorage.setItem("userType", userInfo.userType);
      await AsyncStorage.setItem("userId", userInfo.id);

      if (userInfo.userType === "INDIVIDUAL") {
        navigation.replace("IndividualHome", { userInfo });
      } else if (userInfo.userType === "COMPANY") {
        navigation.replace("CompanyHome", { userInfo });
      }
    } catch (error) {
      console.error("Failed to update user data:", error.response ? error.response.data : error);
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
            <TouchableOpacity
              onPress={() => handleSkillToggle(item)}
              style={[styles.skillButton, selectedSkills[item] && styles.selectedSkill]}
            >
              <Text style={[styles.skillText, selectedSkills[item] && styles.selectedSkillText]}>
                {item}
              </Text>
            </TouchableOpacity>

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

      <View style={styles.remoteContainer}>
        <Text style={styles.remoteText}>Remote:</Text>
        <TouchableOpacity
          style={[styles.remoteButton, isRemote && styles.remoteSelected]}
          onPress={() => setIsRemote(!isRemote)}
        >
          <Text style={styles.remoteButtonText}>{isRemote ? "YES" : "NO"}</Text>
        </TouchableOpacity>
      </View>

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
      <Text style={styles.title}>Select Your Salary Range:</Text>
              <View style={styles.salaryContainer}>
<Text style={{ color: "#ffffff", fontWeight: "bold" }}>Min Salary:</Text>
                <TouchableOpacity onPress={() => handleSalaryChange("min", -1000)}>
                  <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
                </TouchableOpacity>
                <Text style={styles.salaryValue}>{salaryMin} €</Text>
                <TouchableOpacity onPress={() => handleSalaryChange("min", 1000)}>
                  <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>
        <View style={styles.salaryContainer}>
<Text style={{ color: "#ffffff", fontWeight: "bold" }}>Max Salary:</Text>
        <TouchableOpacity onPress={() => handleSalaryChange("max", -1000)}>
          <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
        </TouchableOpacity>
        <Text style={styles.salaryValue}>{salaryMax} €</Text>
        <TouchableOpacity onPress={() => handleSalaryChange("max", 1000)}>
          <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Quel type de contrat cherches-tu ?</Text>
      <View style={styles.contractContainer}>
        {["full_time", "part_time", "internship", "freelance"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.contractButton,
              employmentType === type && styles.contractSelected,
            ]}
            onPress={() => setEmploymentType(type)}
          >
            <Text
              style={[
                styles.contractText,
                employmentType === type && styles.contractTextSelected,
              ]}
            >
              {type.replace("_", " ").toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {employmentTypeError ? (
        <Text style={styles.errorText}>{employmentTypeError}</Text>
      ) : null}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>SUBMIT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 16,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  skillContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  skillButton: {
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  selectedSkill: {
    backgroundColor: "#3b82f6",
  },
  skillText: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
  selectedSkillText: {
    color: "#ffffff",
  },
  experienceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  experienceValue: {
    color: "#ffffff",
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  remoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    justifyContent: "center",
  },
  remoteText: {
    color: "#ffffff",
    fontSize: 18,
    marginRight: 8,
  },
  remoteButton: {
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  remoteSelected: {
    backgroundColor: "#3b82f6",
  },
  remoteButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  locationButton: {
    backgroundColor: "#1e293b",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  selectedLocation: {
    backgroundColor: "#3b82f6",
  },
  locationText: {
    color: "#3b82f6",
    textAlign: "center",
  },
  selectedLocationText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  salaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginVertical: 10,
  },
  salaryValue: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },contractText: {
      fontSize: 12,
      color: '#3b82f6',
      fontWeight: 'bold',
    },
    contractTextSelected: {
      color: 'white',
    },contractButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 2,
        borderColor: '#3b82f6',
        borderRadius: 8,
        margin: 4,
        backgroundColor: '#1e293b',
      },
      contractSelected: {
        backgroundColor: '#3b82f6',
      },contractContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 10,
        },
  submitButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
});

export default JobSeekerOnboardingPage;
