import React, { useState, useEffect } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { View,Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const CreateOfferPage = ({ navigation }) => {
  const [companyId, setCompanyId] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [salaryMin, setSalaryMin] = useState(30000);
  const [salaryMax, setSalaryMax] = useState(60000);
  const [salaryError, setSalaryError] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [employmentTypeError, setEmploymentTypeError] = useState('');
  const [remote, setRemote] = useState(false);
  const [category, setCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationError, setLocationError] = useState('');
  const [selectedSkills, setSelectedSkills] = useState({});
  const [skillsList, setSkillsList] = useState([{ name: '', experience: 1 }]);
  const [skillsError, setSkillsError] = useState('');

    const addSkillRow = () => {
      setSkillsList([...skillsList, { name: '', experience: 1 }]);
    };

    const removeSkillAtIndex = (index) => {
      const updated = [...skillsList];
      updated.splice(index, 1);
      setSkillsList(updated);
    };

    const updateSkillAtIndex = (index, field, value) => {
      const updated = [...skillsList];
      updated[index][field] = field === 'experience' ? parseInt(value) : value;
      setSkillsList(updated);
    };

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

    const normalizedAvailableSkills = allSkills.map(skill => skill.toLowerCase());
const availableLocations = [
  "Chicago, Cook County",
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
  useEffect(() => {
    const getCompanyId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setCompanyId(id);
    };
    getCompanyId();
  }, []);

  const handleLocationToggle = (location) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(loc => loc !== location)
        : [...prev, location]
    );
  };

  const handleSkillToggle = (skill) => {
    setSelectedSkills((prev) => {
      const newSkills = { ...prev };
      if (newSkills[skill]) delete newSkills[skill];
      else newSkills[skill] = 1;
      return newSkills;
    });
  };

  const handleExperienceChange = (skill, value) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skill]: Math.max(1, prev[skill] + value),
    }));
  };

  const validateInputs = () => {
    let isValid = true;
    const titleNoSpace = title.replace(/\s/g, '');
    const descNoSpace = description.replace(/\s/g, '');

    setTitleError(titleNoSpace.length < 7 ? 'Titre trop court.' : '');
    setDescriptionError(descNoSpace.length < 20 ? 'Description trop courte.' : '');
    setSalaryError(salaryMin >= salaryMax ? 'Salaire min doit être inférieur au max.' : '');
    setEmploymentTypeError(!employmentType ? 'Type requis.' : '');
    setCategoryError(!category ? 'Catégorie requise.' : '');
    setLocationError(selectedLocations.length === 0 ? 'Sélectionnez au moins une ville.' : '');

    const filledSkills = skillsList.filter(skill => skill.name.trim() !== '');
    if (filledSkills.length === 0) {
      setSkillsError('Ajoutez au moins une compétence.');
    } else {
      setSkillsError('');
    }

    if (
      titleNoSpace.length < 7 || descNoSpace.length < 20 ||
      salaryMin >= salaryMax || !employmentType || !category ||
      selectedLocations.length === 0 || filledSkills.length === 0
    ) {
      isValid = false;
    }

    return isValid;
  };


  const handleSubmit = async () => {
    if (!validateInputs()) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
        const skills = skillsList
          .filter(skill => skill.name.trim() !== '')
          .map(skill => ({ name: skill.name, experience: skill.experience }));

      const newOffer = {
        title, description, companyId, salaryMin, salaryMax,
        employmentType, remote, category, locations: selectedLocations, skills,
      };

      const res = await axios.post('http://localhost:8080/joboffers', newOffer, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 201 || res.status === 200) {
        Alert.alert("Offre enregistrée", "Votre nouvelle offre a bien été créée.");
        navigation.goBack(); // ou navigation.navigate('MyOffersPage')
      } else {
        Alert.alert("Erreur", "Échec de la création de l’offre.");
      }
    } catch (error) {
      console.error(" Erreur création offre :", error);
      Alert.alert("Erreur", "Une erreur est survenue.");
    }
  };

  return (
         <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                  <Text style={styles.backButtonText}>Retour</Text>
                </TouchableOpacity>

                <Text style={styles.headerText}>Créer une nouvelle offre</Text>

               <TextInput
                 placeholder="Titre de l'offre"
                 value={title}
                 onChangeText={(text) => {
                   setTitle(text);
                   const textWithoutSpaces = text.replace(/\s/g, '');
                   if (textWithoutSpaces.length < 7) {
                     setTitleError("Le titre doit contenir au moins 7 caractères (hors espaces).");
                   } else {
                     setTitleError('');
                   }
                 }}
                 style={[styles.input, titleError ? styles.inputError : null]}
               />
               {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

               <TextInput
                 placeholder="Description de l'offre"
                 value={description}
                 onChangeText={(text) => {
                   setDescription(text);
                   const textWithoutSpaces = text.replace(/\s/g, '');
                   if (textWithoutSpaces.length < 20) {
                     setDescriptionError("La description doit contenir au moins 20 caractères (hors espaces).");
                   } else {
                     setDescriptionError('');
                   }
                 }}
                 style={[styles.input, { height: 100 }, descriptionError ? styles.inputError : null]}
                   multiline
                 />
                 {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}

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

              <Text style={styles.label}>Type de contrat :</Text>
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
                      {type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
                  </View>
                  {employmentTypeError ? (
                    <Text style={styles.errorText}>{employmentTypeError}</Text>
                  ) : null}
                  <Text style={styles.label}>Télétravail :</Text>
                  <View style={styles.remoteContainer}>
                    <TouchableOpacity
                      style={[styles.remoteButton, remote && styles.remoteSelected]}
                      onPress={() => setRemote(!remote)}
                    >
                      <Text style={styles.remoteButtonText}>
                        {remote ? "OUI" : "NON"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.label}>Catégorie :</Text>
                  <View style={styles.contractContainer}>
                    {[
                      "Développement Web",
                            "Ingénieur DevOps",
                            "Business Developer",
                            "Software Developer",
                            "Data Science",
                            "Marketing",
                            "Finance",
                            "Cybersecurity",
                            "Support IT",
                            "Cloud Computing",
                            "Solution Architect",
                            "Business Analyst",
                            "AI/ML",
                            "Other",
                    ].map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.contractButton,
                          category === cat && styles.contractSelected,
                        ]}
                        onPress={() => setCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.contractText,
                            category === cat && styles.contractTextSelected,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {categoryError ? <Text style={styles.errorText}>{categoryError}</Text> : null}
                  <Text style={styles.label}>Villes concernées :</Text>

                  {selectedLocations.map((loc, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <Picker
                        selectedValue={loc}
                        onValueChange={(value) => {
                          const updated = [...selectedLocations];
                          updated[index] = value;
                          setSelectedLocations(updated);
                        }}
                        style={{ flex: 1, height: 50, color: '#fff', backgroundColor: '#1e293b' }}
                      >
                        <Picker.Item label="Sélectionner une ville" value="" />
                        {availableLocations.map((city, i) => (
                          <Picker.Item key={i} label={city} value={city} />
                        ))}
                      </Picker>

                      <TouchableOpacity onPress={() => {
                        const updated = [...selectedLocations];
                        updated.splice(index, 1);
                        setSelectedLocations(updated);
                      }} style={{ marginLeft: 10 }}>
                        <Ionicons name="trash-outline" size={24} color="#dc3545" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity onPress={() => setSelectedLocations([...selectedLocations, ""])} style={{ marginBottom: 10 }}>
                    <Text style={{ color: '#3b82f6', textAlign: 'center' }}>+ Ajouter une localisation</Text>
                  </TouchableOpacity>

                  {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}

                      <Text style={styles.label}>Compétences requises :</Text>

                      <View style={{ marginTop: 20 }}>
                        <Text style={styles.sectionTitle}>Compétences</Text>

                        {skillsList.map((skill, index) => (
                          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <Picker
                              selectedValue={skill.name}
                              onValueChange={(value) => updateSkillAtIndex(index, 'name', value)}
                              style={{ flex: 1, height: 50 }}
                            >
                              <Picker.Item label="Sélectionner une compétence" value="" />
                              {normalizedAvailableSkills.map((s, i) => (
                                <Picker.Item key={i} label={s} value={s} />
                              ))}
                            </Picker>

                            <TouchableOpacity onPress={() => updateSkillAtIndex(index, 'experience', skill.experience - 1)}>
                              <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
                            </TouchableOpacity>

                            <Text style={{ color: 'white', marginHorizontal: 8 }}>{skill.experience} an(s)</Text>

                            <TouchableOpacity onPress={() => updateSkillAtIndex(index, 'experience', skill.experience + 1)}>
                              <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => removeSkillAtIndex(index)} style={{ marginLeft: 10 }}>
                              <Ionicons name="trash-outline" size={24} color="#dc3545" />
                            </TouchableOpacity>
                          </View>
                        ))}

                        {skillsError ? <Text style={{ color: 'red' }}>{skillsError}</Text> : null}

                        <TouchableOpacity onPress={addSkillRow} style={{ marginBottom: 10 }}>
                          <Text style={{ color: '#007bff', textAlign: 'center' }}>+ Ajouter une compétence</Text>
                        </TouchableOpacity>
                      </View>

                <Button title="Soumettre l'offre" onPress={handleSubmit} />
     </ScrollView>
     );
};


const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#0f172a',
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
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
    fontSize: 14,
    color: '#fff',
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
    color: '#fff',
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
    borderColor: '#3b82f6',
    borderRadius: 8,
    margin: 4,
    backgroundColor: '#1e293b',
  },
  contractSelected: {
    backgroundColor: '#3b82f6',
  },
  contractText: {
    fontSize: 12,
    color: '#3b82f6',
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
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#60a5fa',
  },
  remoteSelected: {
    backgroundColor: '#60a5fa',
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
    borderColor: '#10b981',
    borderRadius: 10,
    margin: 4,
    backgroundColor: '#1e293b',
  },
  selectedLocation: {
    backgroundColor: '#10b981',
  },
  locationText: {
    fontSize: 12,
    color: '#10b981',
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
    borderColor: '#3b82f6',
    borderRadius: 8,
    backgroundColor: '#1e293b',
    marginBottom: 4,
  },
  selectedSkill: {
    backgroundColor: '#3b82f6',
  },
  skillText: {
    fontSize: 13,
    color: '#3b82f6',
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
    color: '#fff',
    marginHorizontal: 6,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    color: '#fff', // ✅ couleur blanche
  },
  subText: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
    color: '#fff', // ✅ couleur blanche
  },

});

export default CreateOfferPage;
