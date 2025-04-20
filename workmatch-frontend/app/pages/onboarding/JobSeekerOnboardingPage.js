import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";

import {
  View, Alert, Text, TouchableOpacity, StyleSheet, FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // ✅ Ajout d'icônes
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from '../../../constants/api';

const JobSeekerOnboardingPage = ({ navigation, route }) => {
  const { userInfo } = route.params;


const allSkills = [
  "html", "css", "javascript", "typescript", "react", "angular", "vue.js", "next.js",
  "node.js", "express.js", "spring boot", "django", "flask", "ruby on rails", "php", "laravel",
  "java", "python", "c#", "c++", "go", "rust", "kotlin", "swift", "ruby",
  "docker", "kubernetes", "ci/cd", "jenkins", "gitlab ci", "terraform", "ansible", "aws", "azure", "gcp",
  "pandas", "numpy", "scikit-learn", "tensorflow", "keras", "pytorch", "matplotlib", "seaborn",
  "cloudformation", "aws lambda", "s3", "ec2", "cloud functions", "firestore",
  "cybersecurity", "penetration testing", "network security", "owasp", "siem", "firewall",
  "sql", "power bi", "excel", "data analysis", "tableau", "uml", "agile", "scrum",
  "git", "github", "bitbucket", "vs code", "jira", "postman", "figma", "notion"
];
const availableLocations = [
  "Chicago, Cook County",
  "Hollywood, Broward County",
  "San Francisco, San Francisco County",
  "Seattle, King County",
  "Boston, Suffolk County",
  "Denver, Denver County",
  "Los Angeles, Los Angeles County",
  "Dallas, Dallas County",
  "Miami, Miami-Dade County",
  "Portland, Multnomah County",
  "Vancouver, Clark County",
  "Orlando, Orange County",
  "Philadelphia, Philadelphia County",
  "Glendale, Los Angeles County",
  "Greenville, Hunt County",
  "Myrtle Point, Coos County",
  "Collierville, Shelby County",
  "Washington, D.C.",
  "Hendersonville, Washington County",
  "Leawood, Johnson County",
  "Columbus, Hempstead County",
  "Framingham, Middlesex County",
  "Rockville, Tolland County",
  "Redstone Arsenal, Madison County",
  "New York, New York County",
  "Arlington, Arlington County",
  "Concord, Contra Costa County",
  "Rochester, Olmsted County",
  "Salt Lake City, Salt Lake County",
  "Bee Cave, Travis County",
  "Minneapolis, Hennepin County",
  "Ashburn, Loudoun County",
  "Gurnee, Lake County",
  "Dahlgren, King George County",
  "Times Square, King County",
  "Pioneer Square, King County",
  "Savage, Anne Arundel County",
  "Hoxeyville, Wexford County",
  "South Waltham, Middlesex County",
  "Harmans, Anne Arundel County",
  "Mc Lean, Fairfax County",
  "San Jose, Santa Clara County",
  "Robertson, Saint Louis County",
  "Plano, Collin County",
  "Glenville, Fairfield County",
  "Aberdeen Proving Ground, Harford County",
  "Addison, Addison County",
  "Addison, Dallas",
  "Aiea, Honolulu",
  "Albuquerque, Bernalillo County",
  "Allentown, Lehigh County",
  "American Fork, Utah County",
  "Ankeny, Polk County",
  "Ann Arbor, Washtenaw County",
  "Anna, Union County",
  "Apex, Delaware County",
  "Atlanta, Fulton County",
  "Auburn Hills, Oakland County",
  "Augusta, Richmond County",
  "Aurora, Arapahoe County",
  "Austin, Travis County",
  "Baltimore, Baltimore County",
  "Bannockburn, Lake County",
  "Barrett Parkway, Cobb County",
  "Basking Ridge, Somerset County",
  "Bay Village, Cuyahoga County",
  "Bedford, Bedford County",
  "Bellevue, King County",
  "Bentonville, Benton County",
  "Bethesda, Montgomery County",
  "Bettendorf, Scott County",
  "Bexley, Franklin County",
  "Birmingham, Jefferson County",
  "Birmingham, Oakland County",
  "Bloomfield, Allegheny County",
  "Bloomington, Hennepin County",
  "Boca Raton, Palm Beach County",
  "Boys Town, Douglas County",
  "Brentwood, Saint Louis County",
  "Brickell, Miami-Dade County",
  "Bridgewater, Plymouth County",
  "Bridgewater, Somerset County",
  "Brielle, Monmouth County",
  "Brooklyn, New York County",
  "Buena Park, Orange County",
  "Buffalo, Buffalo County",
  "Burr Ridge, DuPage County",
  "Calabasas Hills, Los Angeles County",
  "California, St. Mary's County",
  "Camden, Camden County",
  "Canal Street, Manhattan",
  "Cary, Wake County",
  "Castlewood, Centennial",
  "Centennial, Arapahoe County",
  "Centerdale, Providence County",
  "Champaign, Champaign County",
  "Charlotte, Mecklenburg County",
  "Chattanooga, Hamilton County",
  "Chesapeake, Chesapeake City",
  "Cincinnati, Hamilton County",
  "Clearwater, Pinellas County",
  "Cleveland, Cuyahoga County",
  "College Park, Clark County",
  "Columbia, Howard County",
  "Columbus, Franklin County",
  "Conowingo, Cecil County",
  "Coppell, Dallas",
  "Coral Springs, Broward County",
  "Coraopolis, Allegheny County",
  "Corunna, Shiawassee County",
  "Coyote, Santa Clara County",
  "Crystal Springs, Copiah County",
  "Cucamonga, San Bernardino County",
  "Culver City, Los Angeles County",
  "Cupertino, Santa Clara County",
  "Custom House, Orleans Parish",
  "Cypress, Orange County",
  "Dallas, Texas",
  "Davie, Broward County",
  "Dayton, Montgomery County",
  "DeKalb, DeKalb County",
  "Des Moines, Polk County",
  "Detroit, Wayne County",
  "Downey, Los Angeles County",
  "Dublin, Alameda County",
  "Dulles, Loudoun County",
  "Durham, Durham County",
  "Easton, Talbot County",
  "Edison, Middlesex County",
  "El Cajon, San Diego County",
  "El Dorado Hills, El Dorado County",
  "Elk Grove, Sacramento County",
  "Englewood, Arapahoe County",
  "Escondido, San Diego County",
  "Evansville, Vanderburgh County",
  "Ewing, Mercer County",
  "Fairfax, Fairfax County",
  "Falls Church, Fairfax County",
  "Fayetteville, Cumberland County",
  "Fishers, Hamilton County",
  "Flint, Genesee County",
  "Fort Collins, Larimer County",
  "Fort Lauderdale, Broward County",
  "Fremont, Alameda County",
  "Frisco, Collin County",
  "Fullerton, Orange County",
  "Garden City, Wayne County",
  "Garland, Dallas County",
  "Gastonia, Gaston County",
  "Glendale, Maricopa County",
  "Grand Prairie, Dallas County",
  "Greenbelt, Prince George's County",
  "Greensboro, Guilford County",
  "Greenville, Pitt County",
  "Grosse Pointe, Wayne County",
  "Hackensack, Bergen County",
  "Hagerstown, Washington County",
  "Hamilton, Butler County",
  "Hanover, York County",
  "Harlingen, Cameron County",
  "Hartford, Hartford County",
  "Haverhill, Essex County",
  "Hayward, Alameda County",
  "Henderson, Clark County",
  "Hermosa Beach, Los Angeles County",
  "Hickory, Catawba County",
  "Hillsboro, Washington County",
  "Hoffman Estates, Cook County",
  "Houston, Harris County",
  "Huntington Beach, Orange County",
  "Hyattsville, Prince George's County",
  "Indianapolis, Marion County",
  "Irving, Dallas County",
  "Jackson, Hinds County",
  "Jacksonville, Duval County",
  "Jamestown, Chautauqua County",
  "Jeffersonville, Clark County",
  "Johnson City, Washington County",
  "Joliet, Will County",
  "Kansas City, Jackson County",
  "Kennesaw, Cobb County",
  "Knoxville, Knox County",
  "Lafayette, Tippecanoe County",
  "Lake Forest, Lake County",
  "Lakewood, Jefferson County",
  "Lancaster, Fairfield County",
  "Lansing, Ingham County",
  "Las Vegas, Clark County",
  "Lawrence, Douglas County",
  "Lee's Summit, Jackson County",
  "Lewisville, Denton County",
  "Lexington, Fayette County",
  "Lincoln, Lancaster County",
  "Little Rock, Pulaski County",
  "Livonia, Wayne County",
  "Long Beach, Los Angeles County",
  "Louisville, Jefferson County",
  "Lubbock, Lubbock County",
  "Madison, Dane County",
  "Madison, Morris County",
  "Manchester, Hartford County",
  "Mansfield, Tarrant County",
  "Marietta, Cobb County",
  "Mesa, Maricopa County",
  "Michigan City, LaPorte County",
  "Midland, Midland County",
  "Milwaukee, Milwaukee County",
  "Miramar, Broward County",
  "Missoula, Missoula County",
  "Mobile, Mobile County",
  "Modesto, Stanislaus County",
  "Montpelier, Washington County",
  "Nashville, Davidson County",
  "Newark, Essex County",
  "Newport News, Newport News City",
  "Norfolk, Norfolk City",
  "North Charleston, Charleston County",
  "North Las Vegas, Clark County",
  "Norwalk, Fairfield County",
  "Oakland, Alameda County",
  "Oklahoma City, Oklahoma County",
  "Omaha, Douglas County",
  "Ontario, San Bernardino County",
  "Orange, Orange County",
  "Overland Park, Johnson County",
  "Oxnard, Ventura County",
  "Pasadena, Los Angeles County",
  "Paterson, Passaic County",
  "Peoria, Peoria County",
  "Phoenix, Maricopa County",
  "Pittsburgh, Allegheny County",
  "Potomac, Montgomery County",
  "Providence, Providence County",
  "Raleigh, Wake County",
  "Rancho Cucamonga, San Bernardino County",
  "Richmond, Richmond City",
  "Riverside, Riverside County",
  "Rochester, Monroe County",
  "Rockford, Winnebago County",
  "Roseville, Placer County",
  "Round Rock, Williamson County",
  "Sacramento, Sacramento County",
  "Saint Paul, Ramsey County",
  "Salinas, Monterey County",
  "San Antonio, Bexar County",
  "San Diego, San Diego County",
  "Santa Clara, Santa Clara County",
  "Santa Monica, Los Angeles County",
  "Santa Rosa, Sonoma County",
  "Shreveport, Caddo Parish",
  "Simi Valley, Ventura County",
  "Sioux Falls, Minnehaha County",
  "South Bend, St. Joseph County",
  "Southfield, Oakland County",
  "Springfield, Greene County",
  "Springfield, Sangamon County",
  "Stamford, Fairfield County",
  "Stanford, Santa Clara County",
  "Starkville, Oktibbeha County",
  "State College, Centre County",
  "State Farm, Arlington County",
  "State House, Lancaster County",
  "Strongsville, Cuyahoga County",
  "Summit Avenue, Hudson County",
  "Sunnyvale, Santa Clara County",
  "Suwanee, Gwinnett County",
  "Syracuse, Onondaga County",
  "Tacoma, Pierce County",
  "Tampa, Hillsborough County",
  "Tarrytown, Westchester County",
  "Temecula, Riverside County",
  "Tempe, Maricopa County",
  "Texas City, Galveston County",
  "Textile Finance, Los Angeles County",
  "Topeka, Shawnee County",
  "Toronto, Ontario",
  "Trammells, Harris County",
  "Troy, Oakland County",
  "Troy, Pike County",
  "Tullahoma, Coffee County",
  "Tulsa, Tulsa County",
  "Tyler Park, Hudson County",
  "Tysons Corner, Fairfax County",
  "Union Park, Orange County",
  "Upper East Side, Manhattan",
  "Upper Marlboro, Prince George's County",
  "Vienna, Fairfax County",
  "View Park, Los Angeles County",
  "Villa Park, Orange County",
  "Virginia Beach, Virginia Beach City",
  "Wake Island, Honolulu",
  "Wall Street, Manhattan",
  "Walnut Creek, Contra Costa County",
  "Waltham, Middlesex County",
  "Washington, D.C., US",
  "Waterloo, Monroe County",
  "Weldon Spring, Saint Charles County",
  "Wellington, Palm Beach County",
  "Wesley Chapel, Pasco County",
  "West Lebanon, Grafton County",
  "West Loop, Chicago",
  "Westlake, Cuyahoga County",
  "Whippany, Morris County",
  "White Bear Lake, Ramsey County",
  "White Plains, Westchester County",
  "William Penn Annex East, Philadelphia County",
  "Williams, Tulsa County",
  "Wilmington, New Castle County",
  "Winston Salem, Forsyth County",
  "Wixom, Oakland County",
  "Woodinville, King County",
  "Woodland Hills, Los Angeles County",
  "Yardley, Bucks County",
  "Yuba City, Sutter County",
  "Youngstown, Mahoning County",
  "Zionsville, Boone County",
  "Jacksonville Beach, Duval County",
  "Charleston, Charleston County",
  "Grand Haven, Ottawa County",
  "Pasadena, Harris County",
  "St. Petersburg, Pinellas County",
  "Oak Brook, DuPage County",
  "Pleasanton, Alameda County",
  "Los Gatos, Santa Clara County",
  "Richmond, Contra Costa County",
  "Buckhead, Fulton County",
  "Dunwoody, DeKalb County",
  "Addison, DuPage County",
  "Medina, Summit County",
  "Burnsville, Dakota County",
  "Katy, Harris County",
  "Waukesha, Waukesha County",
  "Kent, King County",
  "Lawrenceville, Gwinnett County",
  "Dover, Kent County",
  "Athens, Clarke County",
  "Rolling Meadows, Cook County",
  "East Hanover, Morris County",
  "Elkhart, Elkhart County",
  "Westerville, Franklin County",
  "Altoona, Blair County",
  "Allen, Collin County",
  "Manteca, San Joaquin County",
  "Torrance, Los Angeles County",
  "Monroe, Ouachita County",
  "Norwood, Norfolk County",
  "Charleston, Kanawha County",
  "Visalia, Tulare County",
  "Fort Worth, Tarrant County",
  "Torrington, Litchfield County",
  "Harrison, Boone County",
  "Brooklyn Park, Hennepin County",
  "Concord, Middlesex County",
  "Pittsfield, Berkshire County",
  "Grand Rapids, Kent County",
  "Wheaton, DuPage County",
  "Aliso Viejo, Orange County",
  "Oakton, Fairfax County",
  "Columbia, Howard County",
  "Norman, Cleveland County",
  "Moline, Rock Island County",
  "Bethlehem, Northampton County",
  "Northfield, Cook County",
  "Springfield, Hampden County",
  "Reading, Berks County",
  "St. Louis, St. Louis County",
  "Port Chester, Westchester County",
  "Kalamazoo, Kalamazoo County",
  "Huntington, Cabell County",
  "San Mateo, San Mateo County",
  "Canton, Stark County",
  "Westfield, Hampden County",
  "Kent, Stark County",
  "Cranford, Union County",
  "Lincolnwood, Cook County",
  "Edmond, Oklahoma County",
  "Saint Cloud, Stearns County",
  "Spokane, Spokane County",
  "Asheville, Buncombe County",
  "Gainesville, Hall County",
  "Woodbury, Washington County",
  "Watertown, Jefferson County",
  "La Jolla, San Diego County",
  "Southlake, Tarrant County",
  "Pearland, Brazoria County",
  "Chesterfield, St. Louis County",
  "Redmond, King County",
  "Arcadia, Los Angeles County",
  "Sumter, Sumter County",
  "O'Fallon, St. Charles County",
  "Franklin, Williamson County",
  "LaGrange, Troup County",
  "Smyrna, Cobb County",
  "Mechanicsburg, Cumberland County",
  "Wylie, Collin County",
  "Roswell, Fulton County",
  "La Porte, Harris County",
  "Schaumburg, Cook County",
  "New Orleans, Orleans Parish",
  "Santa Fe, Santa Fe County",
  "San Juan Capistrano, Orange County",
  "Naperville, DuPage County",
  "Sterling Heights, Macomb County",
  "San Marcos, Hays County",
  "Van Nuys, Los Angeles County",
  "Florence, Lauderdale County",
  "Rancho Santa Margarita, Orange County",
  "Oceanside, San Diego County",
  "McKinney, Collin County",
  "Jackson, Madison County",
  "Bismarck, Burleigh County",
  "Hilo, Hawaii County",
  "Aiken, Aiken County",
  "Albany, Albany County",
  "Alpharetta, Fulton County",
  "Atlanta, Georgia",
  "Austin, Texas",
  "Bethpage, Nassau County",
  "Buffalo Grove, Lake County",
  "Cambridge, Middlesex County",
  "Campbell, Santa Clara County",
  "Canton, Norfolk County",
  "Chantilly, Fairfax County",
  "Charlotte, North Carolina",
  "Chicago, Illinois",
  "Cincinnati, Ohio",
  "Columbus, Ohio",
  "Denver, Colorado",
  "Dothan, Houston County",
  "Dutton, Kent County",
  "Eagan, Dakota County",
  "East Lake-Orient Park, Hillsborough County",
  "East Millstone, Somerset County",
  "East Palo Alto, Santa Clara County",
  "East Pilsen, Chicago",
  "Edina, Hennepin County",
  "El Segundo, Los Angeles County",
  "Elgin, Kane County",
  "Emeryville, Alameda County",
  "Etna, Siskiyou County",
  "Fifth Ward/Frenchtown, Houston",
  "Financial District, San Francisco",
  "Florin, Sacramento County",
  "Folsom, Sacramento County",
  "Forest Glen, Montgomery County",
  "Fort Lee, Bergen County",
  "Frazer, Chester County",
  "Glendale, Denver",
  "Grand Central, Manhattan",
  "Greenwood Village, Arapahoe County",
  "Guadalupe, Maricopa County",
  "Hawthorne, Los Angeles County"
];
  // État pour stocker les compétences sélectionnées et leur expérience
  const [skillsList, setSkillsList] = useState([{ name: '', experience: 1 }]);  const [isRemote, setIsRemote] = useState(false); // Ajout du remote toggle
  const [selectedLocations, setSelectedLocations] = useState([]); // Ajout pour les villes
  const [salaryMin, setSalaryMin] = useState(30000);
  const [salaryMax, setSalaryMax] = useState(60000);
    const [employmentType, setEmploymentType] = useState('');
    const [employmentTypeError, setEmploymentTypeError] = useState('');

// Gestion des compétences
const addSkillRow = () => {
  setSkillsList([...skillsList, { name: '', experience: 1 }]);
};

const removeSkillAtIndex = (index) => {
  setSkillsList(skillsList.filter((_, i) => i !== index));
};

const updateSkillAtIndex = (index, field, value) => {
  const updated = [...skillsList];
  updated[index][field] = field === 'experience' ? parseInt(value) : value;
  setSkillsList(updated);
};

// Gestion des localisations
const addLocation = () => {
  setSelectedLocations([...selectedLocations, ""]);
};

const updateLocationAtIndex = (index, value) => {
  const updated = [...selectedLocations];
  updated[index] = value;
  setSelectedLocations(updated);
};

const removeLocationAtIndex = (index) => {
  setSelectedLocations(selectedLocations.filter((_, i) => i !== index));
};

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
  const [skillsError, setSkillsError] = useState('');
  const [locationsError, setLocationsError] = useState('');

  const handleSubmit = async () => {
    console.log("handleSubmit triggered"); // <- AJOUTE ÇA

    // Validation des champs
    const hasAtLeastOneSkill = skillsList.some(skill => skill.name.trim() !== '');
    const hasAtLeastOneLocation = selectedLocations.some(loc => loc.trim() !== '');
    const hasSelectedContract = employmentType !== '';

    if (!hasAtLeastOneSkill || !hasAtLeastOneLocation || !hasSelectedContract) {
      setSkillsError(!hasAtLeastOneSkill ? "Veuillez sélectionner au moins une compétence." : '');
      setLocationsError(!hasAtLeastOneLocation ? "Veuillez sélectionner au moins une localisation." : '');
      setEmploymentTypeError(!hasSelectedContract ? "Veuillez choisir un type de contrat." : '');
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");

      const formattedSkills = skillsList
        .filter(skill => skill.name.trim() !== '')
        .map(skill => ({
          name: skill.name,
          experience: skill.experience
        }));

      await axios.put(
        `${BASE_URL}/jobsearchers/${userInfo.id}/updateUser`,
        {
          skills: formattedSkills,
          remote: isRemote,
          locations: selectedLocations.filter(loc => loc !== ""),
          salaryMin,
          salaryMax,
          employmentType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
console.log("Compte mis à jour, on affiche l'alerte");

      // ✅ Affichage d'un message de confirmation puis redirection vers SignIn
      // Remplace ceci :
      Alert.alert(
        "Compte créé",
        "Votre compte a été créé avec succès. Veuillez vous connecter.",
        [
          {
            text: "OK",
            onPress: () => navigation.replace("SignIn")
          }
        ]
      );

      // Par ça :
      window.alert("Votre compte a été créé avec succès. Veuillez vous connecter.");
      navigation.replace("SignIn");

    } catch (error) {
      console.error("Error:", error);
      alert("Update failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Pour les compétences */}
      {skillsList.map((skill, index) => (
        <View key={index} style={styles.rowContainer}>
          <Picker
            selectedValue={skill.name}
            onValueChange={(itemValue) => updateSkillAtIndex(index, 'name', itemValue)}
            style={styles.picker}
            mode="dropdown"
          >
            <Picker.Item label="Select skill" value="" />
            {allSkills.map((s, i) => (
              <Picker.Item key={`skill-${i}`} label={s} value={s} />
            ))}
          </Picker>


          <View style={styles.experienceControls}>
            <TouchableOpacity onPress={() => updateSkillAtIndex(index, 'experience', skill.experience - 1)}>
              <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
            </TouchableOpacity>
            <Text style={styles.experienceValue}>{skill.experience} year(s)</Text>
            <TouchableOpacity onPress={() => updateSkillAtIndex(index, 'experience', skill.experience + 1)}>
              <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => removeSkillAtIndex(index)}>
            <Ionicons name="trash-outline" size={24} color="#dc3545" />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={addSkillRow} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Skill</Text>
      </TouchableOpacity>
{skillsError ? <Text style={styles.errorText}>{skillsError}</Text> : null}

      {/* Pour les localisations */}
      {selectedLocations.map((location, index) => (
        <View key={`loc-${index}`} style={styles.rowContainer}>
          <Picker
            selectedValue={location}
            onValueChange={(itemValue) => updateLocationAtIndex(index, itemValue)}
            style={styles.picker}
            mode="dropdown"
          >
            <Picker.Item label="Select location" value="" />
            {availableLocations.map((loc, i) => (
              <Picker.Item key={`loc-${i}`} label={loc} value={loc} />
            ))}
          </Picker>


          <TouchableOpacity onPress={() => removeLocationAtIndex(index)}>
            <Ionicons name="trash-outline" size={24} color="#dc3545" />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={addLocation} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Location</Text>
      </TouchableOpacity>
{locationsError ? <Text style={styles.errorText}>{locationsError}</Text> : null}

      <View style={styles.remoteContainer}>
        <Text style={styles.remoteText}>Remote:</Text>
        <TouchableOpacity
          style={[styles.remoteButton, isRemote && styles.remoteSelected]}
          onPress={() => setIsRemote(!isRemote)}
        >
          <Text style={styles.remoteButtonText}>{isRemote ? "YES" : "NO"}</Text>
        </TouchableOpacity>
      </View>

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
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  picker: {
    flex: 1,
    height: 50,
    color: "#ffffff",
    backgroundColor: "#1e293b",
  },
  experienceControls: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  }
,
  experienceValue: {
    color: "#ffffff",
    marginHorizontal: 8,
  },
  addButton: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default JobSeekerOnboardingPage;
