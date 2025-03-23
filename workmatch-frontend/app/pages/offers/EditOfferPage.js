import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';

const allSkills = ["JavaScript", "React", "Node.js", "Python", "Java", "C#", "Ruby", "Swift"];
const allCities = ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Bordeaux", "Lille", "Nantes"];
const allCategories = [
  "Développement Web",
  "Ingénieur DevOps",
  "Business Developer",
  "Software Developer",
  "Data Science",
  "Marketing",
  "Finance",
];

const EditOfferPage = ({ route, navigation }) => {
  const { offer } = route.params;

  const [title, setTitle] = useState(offer.title);
    const [description, setDescription] = useState(offer.description);
    const [salaryMin, setSalaryMin] = useState(offer.salaryMin);
    const [salaryMax, setSalaryMax] = useState(offer.salaryMax);
    const [employmentType, setEmploymentType] = useState(offer.employmentType);
    const [remote, setRemote] = useState(offer.remote);
    const [category, setCategory] = useState(offer.category);
    const [selectedLocations, setSelectedLocations] = useState(offer.locations || []);
    const [selectedSkills, setSelectedSkills] = useState(
      offer.skills.reduce((acc, skill) => {
        acc[skill.name] = skill.experience;
        return acc;
      }, {})
    );

    const [titleError, setTitleError] = useState('');
      const [descriptionError, setDescriptionError] = useState('');
      const [salaryError, setSalaryError] = useState('');
      const [employmentTypeError, setEmploymentTypeError] = useState('');
      const [categoryError, setCategoryError] = useState('');
      const [locationError, setLocationError] = useState('');
      const [skillsError, setSkillsError] = useState('');

const handleLocationToggle = (location) => {
    setSelectedLocations((prev) =>
      prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]
    );
  };

  const handleSkillToggle = (skill) => {
      setSelectedSkills((prev) => {
        const newSkills = { ...prev };
        if (newSkills[skill]) {
          delete newSkills[skill];
        } else {
          newSkills[skill] = 1;
        }
        return newSkills;
      });
    };

const handleExperienceChange = (skill, value) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skill]: Math.max(1, (prev[skill] || 1) + value),
    }));
  };

const validateInputs = () => {
    let isValid = true;
    const titleWithoutSpaces = title.replace(/\s/g, '');
    const descriptionWithoutSpaces = description.replace(/\s/g, '');

    if (titleWithoutSpaces.length < 7) {
      setTitleError('Le titre doit contenir au moins 7 caractères (hors espaces).');
      isValid = false;
    } else {
      setTitleError('');
    }

    if (descriptionWithoutSpaces.length < 20) {
      setDescriptionError('La description doit contenir au moins 20 caractères.');
      isValid = false;
    } else {
      setDescriptionError('');
    }

    if (salaryMin >= salaryMax) {
      setSalaryError("Le salaire minimum doit être inférieur au maximum.");
      isValid = false;
    } else {
      setSalaryError('');
    }

    if (!employmentType) {
      setEmploymentTypeError("Veuillez choisir un type de contrat.");
      isValid = false;
    } else {
      setEmploymentTypeError('');
    }

    if (!category) {
      setCategoryError("Veuillez choisir une catégorie.");
      isValid = false;
    } else {
      setCategoryError('');
    }

    if (selectedLocations.length === 0) {
      setLocationError("Veuillez choisir au moins une ville.");
      isValid = false;
    } else {
      setLocationError('');
    }

    if (Object.keys(selectedSkills).length === 0) {
      setSkillsError("Veuillez choisir au moins une compétence.");
      isValid = false;
    } else {
      setSkillsError('');
    }

    return isValid;
  };

  const handleUpdate = async () => {
  if (!validateInputs()) return;

  const token = await AsyncStorage.getItem('userToken');


const updatedOffer = {
      title,
      description,
      salaryMin,
      salaryMax,
      employmentType,
      remote,
      category,
      locations: selectedLocations,
      skills: Object.entries(selectedSkills).map(([name, experience]) => ({
        name,
        experience,
      })),
    };
    try {
const response = await axios.put(
        `http://localhost:8080/joboffers/${offer._id}`,
        updatedOffer,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        navigation.navigate('MyOffersPage')
      }


    } catch (error) {
      console.error("❌ Erreur de mise à jour :", error);
      Alert.alert("Erreur", "Impossible de mettre à jour l’offre.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ color: '#007bff', marginBottom: 10 }}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Titre de l'offre :</Text>
      <TextInput
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          const noSpace = text.replace(/\s/g, '');
          setTitleError(noSpace.length < 7 ? "Le titre doit contenir au moins 7 caractères." : '');
        }}
        style={[styles.input, titleError ? styles.inputError : null]}
      />
      {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

      <Text style={styles.label}>Description :</Text>
      <TextInput
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          const noSpace = text.replace(/\s/g, '');
          setDescriptionError(noSpace.length < 20 ? "La description doit contenir au moins 20 caractères." : '');
        }}
        multiline
        style={[styles.input, { height: 100 }, descriptionError ? styles.inputError : null]}
      />
      {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}

      {/* Salaire */}
      <View style={styles.salaryContainer}>
        <Text style={styles.label}>Salaire Minimum :</Text>
        <View style={styles.salaryControls}>
          <TouchableOpacity onPress={() => setSalaryMin((prev) => Math.max(10000, Math.min(prev - 1000, salaryMax - 1000)))}>
            <Ionicons name="remove-circle-outline" size={20} color="#6c757d" />
          </TouchableOpacity>
          <Text style={styles.salaryValue}>{salaryMin} €</Text>
          <TouchableOpacity onPress={() => setSalaryMin((prev) => Math.min(prev + 1000, salaryMax - 1000))}>
            <Ionicons name="add-circle-outline" size={20} color="#6c757d" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.salaryContainer}>
        <Text style={styles.label}>Salaire Maximum :</Text>
        <View style={styles.salaryControls}>
          <TouchableOpacity onPress={() => setSalaryMax((prev) => Math.max(salaryMin + 1000, prev - 1000))}>
            <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
          </TouchableOpacity>
          <Text style={styles.salaryValue}>{salaryMax} €</Text>
          <TouchableOpacity onPress={() => setSalaryMax((prev) => prev + 1000)}>
            <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
          </TouchableOpacity>
        </View>
      </View>
      {salaryError ? <Text style={styles.errorText}>{salaryError}</Text> : null}

      {/* Type de contrat */}
      <Text style={styles.label}>Type de contrat :</Text>
      <View style={styles.contractContainer}>
        {["full_time", "part_time", "internship", "freelance"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.contractButton, employmentType === type && styles.contractSelected]}
            onPress={() => setEmploymentType(type)}
          >
            <Text style={[styles.contractText, employmentType === type && styles.contractTextSelected]}>
              {type.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {employmentTypeError ? <Text style={styles.errorText}>{employmentTypeError}</Text> : null}

      {/* Télétravail */}
      <Text style={styles.label}>Télétravail :</Text>
      <View style={styles.remoteContainer}>
        <TouchableOpacity
          style={[styles.remoteButton, remote && styles.remoteSelected]}
          onPress={() => setRemote(!remote)}
        >
          <Text style={styles.remoteButtonText}>{remote ? "OUI" : "NON"}</Text>
        </TouchableOpacity>
      </View>

      {/* Catégorie */}
      <Text style={styles.label}>Catégorie :</Text>
      <View style={styles.contractContainer}>
        {allCategories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.contractButton, category === cat && styles.contractSelected]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.contractText, category === cat && styles.contractTextSelected]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {categoryError ? <Text style={styles.errorText}>{categoryError}</Text> : null}

      {/* Villes */}
      <Text style={styles.label}>Villes concernées :</Text>
      <View style={styles.locationContainer}>
        {allCities.map((city) => (
          <TouchableOpacity
            key={city}
            style={[styles.locationButton, selectedLocations.includes(city) && styles.selectedLocation]}
            onPress={() => handleLocationToggle(city)}
          >
            <Text style={[styles.locationText, selectedLocations.includes(city) && styles.selectedLocationText]}>
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}

      {/* Compétences */}
      <Text style={styles.label}>Compétences requises :</Text>
      <View style={styles.skillContainer}>
        {allSkills.map((skill) => (
          <View key={skill} style={{ alignItems: "center", marginVertical: 8 }}>
            <TouchableOpacity
              onPress={() => handleSkillToggle(skill)}
              style={[styles.skillButton, selectedSkills[skill] && styles.selectedSkill]}
            >
              <Text style={[styles.skillText, selectedSkills[skill] && styles.selectedSkillText]}>
                {skill}
              </Text>
            </TouchableOpacity>

            {selectedSkills[skill] && (
              <View style={styles.experienceContainer}>
                <TouchableOpacity onPress={() => handleExperienceChange(skill, -1)}>
                  <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
                </TouchableOpacity>
                <Text style={styles.experienceValue}>{selectedSkills[skill]} years</Text>
                <TouchableOpacity onPress={() => handleExperienceChange(skill, 1)}>
                  <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
      {skillsError ? <Text style={styles.errorText}>{skillsError}</Text> : null}

      <Button title="Mettre à jour l'offre" onPress={handleUpdate} />
    </ScrollView>
  );

};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 5,
    fontSize: 14,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 6,
    fontSize: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  salaryContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  salaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  salaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  contractContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  contractButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#007bff',
    borderRadius: 8,
    margin: 4,
  },
  contractSelected: {
    backgroundColor: '#007bff',
  },
  contractText: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: 'bold',
  },
  contractTextSelected: {
    color: 'white',
  },
  remoteContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  remoteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#ccc',
  },
  remoteSelected: {
    backgroundColor: '#007bff',
  },
  remoteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  locationButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#28a745',
    borderRadius: 10,
    margin: 4,
  },
  selectedLocation: {
    backgroundColor: '#28a745',
  },
  locationText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: 'bold',
  },
  selectedLocationText: {
    fontSize: 12,
    color: 'white',
  },
  skillContainer: {
    marginBottom: 10,
  },
  skillButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#007bff',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 4,
  },
  selectedSkill: {
    backgroundColor: '#007bff',
  },
  skillText: {
    fontSize: 13,
    color: '#007bff',
  },
  selectedSkillText: {
    fontSize: 13,
    color: 'white',
    fontWeight: 'bold',
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  experienceValue: {
    fontSize: 13,
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
});

export default EditOfferPage;
