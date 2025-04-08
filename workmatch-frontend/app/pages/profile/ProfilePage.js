import React, { useEffect, useState } from 'react';
import { Image, Button, View, Text, StyleSheet, ScrollView,TextInput,Alert,TouchableOpacity}from 'react-native';// ✅ AJOUTE CECI } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckBox } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import SockJS from 'sockjs-client';

const ProfilePage = () => {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(null);
    const [userType, setUserType] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [tempSelectedCategories, setTempSelectedCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [skills, setSkills] = useState({});
    const [skillsSuccess, setSkillsSuccess] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [isRemotePreferred, setIsRemotePreferred] = useState(false);
    const [remoteSuccess, setRemoteSuccess] = useState(false);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [locationDropdowns, setLocationDropdowns] = useState(1);
    const [locationSuccess, setLocationSuccess] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [employmentType, setEmploymentType] = useState('');
    const [employmentTypeSuccess, setEmploymentTypeSuccess] = useState(false);
    const [salaryMin, setSalaryMin] = useState(30000);
    const [salaryMax, setSalaryMax] = useState(60000);
    const [skillsList, setSkillsList] = useState([{ name: '', experience: 1 }]);

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

    const allCities = [
      "Chicago, Cook County",
      "San Francisco, San Francisco County",
      "Seattle, King County",
      "Boston, Suffolk County",
      "Denver, Denver County",
      "Los Angeles, Los Angeles County",
      "Dallas, Dallas County",
      "Miami, Miami-Dade County","Portland, Oregon","Vancouver, Clark County","Orlando, Orange County",
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
      "Portland, Multnomah County",
      "New York City, New York",
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
      "Aiken, Aiken County",
      "Albany, Albany County",
      "Albuquerque, Bernalillo County",
      "Allentown, Lehigh County",
      "Alpharetta, Fulton County",
      "American Fork, Utah County",
      "Ankeny, Polk County",
      "Ann Arbor, Washtenaw County",
      "Anna, Union County",
      "Apex, Delaware County",
      "Atlanta, Fulton County",
      "Auburn Hills, Oakland County",
      "Augusta, Richmond County",
      "Aurora, Arapahoe County",
      "Austin, Lonoke County",
      "Austin, Travis County",
      "Baltimore, Baltimore County",
      "Bannockburn, Lake County",
      "Barrett Parkway, Cobb County",
      "Basking Ridge, Somerset County",
      "Bay Village, Cuyahoga County",
      "Bedford, Bedford County",
      "Bellevue, Huron County",
      "Bellevue, King County",
      "Bentonville, Benton County",
      "Bethesda, Montgomery County",
      "Bethpage, Nassau County",
      "Bettendorf, Scott County",
      "Bexley, Franklin County",
      "Birmingham, Jefferson County",
      "Birmingham, Oakland County",
      "Bloomfield, Allegheny County",
      "Bloomington, Hennepin County",
      "Bloomington, San Bernardino County",
      "Boca Raton, Palm Beach County",
      "Boston, Thomas County",
      "Boys Town, Douglas County",
      "Brentwood, Saint Louis County",
      "Brickell, Miami-Dade County",
      "Bridgewater, Plymouth County",
      "Bridgewater, Somerset County",
      "Brielle, Monmouth County",
      "Brooklyn, New York City",
      "Buena Park, Orange County",
      "Buffalo Grove, Lake County",
      "Buffalo, Buffalo County",
      "Burnsville, Dakota County",
      "Burr Ridge, DuPage County",
      "Calabasas Hills, Los Angeles County",
      "California, St. Mary's County",
      "California, US",
      "Cambridge, Middlesex County",
      "Camden, Camden County",
      "Campbell, Santa Clara County",
      "Canal Street, Manhattan",
      "Canton, Norfolk County",
      "Cary, Wake County",
      "Castlewood, Centennial",
      "Centennial, Arapahoe County",
      "Centerdale, Providence County",
      "Champaign, Champaign County",
      "Charleston, Kanawha County",
      "Charlotte, Mecklenburg County",
      "Chattanooga, Hamilton County",
      "Chesapeake, Chesapeake City",
      "Cincinnati, Hamilton County",
      "Clearwater, Pinellas County",
      "Cleveland, Cuyahoga County",
      "College Park, Clark County",
      "Columbia, Columbia County",
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
      "Fort Worth, Tarrant County",
      "Fremont, Alameda County",
      "Frisco, Collin County",
      "Fullerton, Orange County",
      "Gainesville, Hall County",
      "Garden City, Wayne County",
      "Garland, Dallas County",
      "Gastonia, Gaston County",
      "Glendale, Maricopa County",
      "Grand Prairie, Dallas County",
      "Grand Rapids, Kent County",
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
      "Naperville, DuPage County",
      "Nashville, Davidson County",
      "New York, New York County",
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
      "Reading, Berks County",
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
      "Springfield, Hampden County",
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
      "Syracuse, Kosciusko County",
      "Syracuse, Onondaga County",
      "Tacoma, Delaware County",
      "Tampa, Hillsborough County",
      "Tarrytown, Travis County",
      "Tarrytown, Westchester County",
      "Temecula, Riverside County",
      "Tempe, Maricopa County",
      "Texas City, Galveston County",
      "Texas, US",
      "Textile Finance, Los Angeles County",
      "Topeka, Shawnee County",
      "Toronto, Deuel County",
      "Trammells, Harris County",
      "Troy, Oakland County",
      "Troy, Pike County",
      "Tullahoma, Coffee County",
      "Tulsa, Tulsa County",
      "Tyler Park, Hudson County",
      "Tysons Corner, Fairfax County",
      "US",
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
      "Washington, Washington, D.C.",
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
      "Wilmington, Los Angeles County",
      "Wilmington, New Castle County",
      "Winston Salem, Forsyth County",
      "Wisconsin, US",
      "Wixom, Oakland County",
      "Woodinville, King County",
      "Woodland Hills, Los Angeles County",
      "Yardley, Bucks County",
      "Yuba City, Sutter County",
      "Youngstown, Mahoning County",
      "Zionsville, Boone County",
      "Austin, Lubbock County",
      "Jacksonville Beach, Duval County",
      "Charleston, Charleston County",
      "Grand Haven, Ottawa County",
      "Pasadena, Harris County",
      "St. Petersburg, Pinellas County",
      "Flint, Genesee County",
      "Oak Brook, DuPage County",
      "Fort Collins, Larimer County",
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
      "Nashville, Davidson County",
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
      "Schaumburg, Cook County",
      "Monroe, Monroe County",
      "Norwood, Norfolk County",
      "Charleston, Kanawha County",
      "Durham, Durham County",
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
      "Shreveport, Caddo Parish",
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
      "Troy, Oakland County",
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
      "Lancaster, Fairfield County",
      "Rancho Santa Margarita, Orange County",
      "Oceanside, San Diego County",
      "McKinney, Collin County",
      "Jackson, Madison County",
      "Bismarck, Burleigh County",
      "Hilo, Hawaii County",
      "Addison, Dallas",
      "Aiken, Aiken County",
      "Albany, Albany County",
      "Alpharetta, Fulton County",
      "Atlanta, Fulton County",
      "Atlanta, Georgia",
      "Austin, Texas",
      "Austin, Travis County",
      "Bethpage, Nassau County",
      "Boca Raton, Palm Beach County",
      "Bridgewater, Plymouth County",
      "Bridgewater, Somerset County",
      "Buffalo Grove, Lake County",
      "Burnsville, Dakota County",
      "Burr Ridge, DuPage County",
      "Cambridge, Middlesex County",
      "Camden, Camden County",
      "Campbell, Santa Clara County",
      "Canton, Norfolk County",
      "Champaign, Champaign County",
      "Chantilly, Fairfax County",
      "Charlotte, Mecklenburg County",
      "Charlotte, North Carolina",
      "Chicago, Cook County",
      "Cincinnati, Ohio",
      "College Park, Clark County",
      "Columbia, Columbia County",
      "Columbia, Howard County",
      "Columbus, Franklin County",
      "Columbus, Ohio",
      "Concord, Contra Costa County",
      "Coral Springs, Broward County",
      "Corunna, Shiawassee County",
      "Custom House, Orleans Parish",
      "Cypress, Orange County",
      "Davie, Broward County",
      "Dayton, Montgomery County",
      "Dearborn, Wayne County",
      "Denver, Colorado",
      "Dothan, Houston County",
      "Dublin, Alameda County",
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
      "Fort Lauderdale, Broward County",
      "Fort Lee, Bergen County",
      "Framingham, Middlesex County",
      "Frazer, Chester County",
      "Glendale, Denver",
      "Glenville, Fairfield County",
      "Grand Central, Manhattan",
      "Grand Rapids, Kent County",
      "Greenville, Hunt County",
      "Greenwood Village, Arapahoe County",
      "Guadalupe, Maricopa County",
      "Hawthorne, Los Angeles County"

    ];

    useEffect(() => {
      const connectNotificationWebSocket = async () => {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const socket = new SockJS('http://localhost:8080/ws');
        const stomp = Stomp.over(socket);
        stomp.debug = null;

        stomp.connect({}, () => {
          stomp.subscribe(`/topic/notifications/${userId}`, async (message) => {
            const msg = JSON.parse(message.body);
            console.log('Notification reçue dans CompanyHomePage !', msg);

            const conversationId = msg.conversationId;
            if (!conversationId) return;

            try {
              const stored = await AsyncStorage.getItem('unreadByConversation');
              const unreadMap = stored ? JSON.parse(stored) : {};

              unreadMap[conversationId] = (unreadMap[conversationId] || 0) + 1;

              await AsyncStorage.setItem('unreadByConversation', JSON.stringify(unreadMap));
            } catch (error) {
              console.error("Erreur de stockage des unreadByConversation :", error);
            }

            const senderId = msg.senderId;

            if (senderId !== userId) {
              setUnreadCount(1); // juste pour forcer l’affichage de la bulle

              // Et incrémenter par conversation :
              AsyncStorage.getItem('unreadByConversation').then((raw) => {
                const map = raw ? JSON.parse(raw) : {};
                const convId = msg.conversationId;

                map[convId] = (map[convId] || 0) + 1;
                AsyncStorage.setItem('unreadByConversation', JSON.stringify(map));
              });
            }

          });
        });

      };

      connectNotificationWebSocket();
    }, []);

    useEffect(() => {
      const loadUnreadCount = async () => {
        const storedCount = await AsyncStorage.getItem('unreadMessageCount');
        if (storedCount !== null) {
          setUnreadCount(parseInt(storedCount, 10));
        }
      };

      loadUnreadCount();
    }, []);

    const addLocationDropdown = () => {
      setLocationDropdowns(prev => prev + 1);
    };

    const handleLocationChange = (index, value) => {
      const updated = [...selectedLocations];
      updated[index] = value;
      setSelectedLocations(updated);
    };

    const availableSkills = [
      "AWS",
      "AWS Lambda",
      "Agile",
      "Angular",
      "Ansible",
      "Architecture Design",
      "Azure",
      "Bitbucket",
      "Business Analysis",
      "C#",
      "C++",
      "CI/CD",
      "CSS",
      "Cloud",
      "Cloud Functions",
      "CloudFormation",
      "Communication",
      "Cybersecurity",
      "Data Analysis",
      "Data Engineering",
      "Data Science",
      "Django",
      "Docker",
      "EC2",
      "Excel",
      "Express",
      "Express.js",
      "Figma",
      "Financial Analysis",
      "Firestore",
      "Firewall",
      "Flask",
      "Frontend",
      "GCP",
      "Git",
      "GitHub",
      "GitLab CI",
      "Go",
      "Google Analytics",
      "GraphQL",
      "HTML",
      "Helpdesk",
      "IT Support",
      "Incident Response",
      "JIRA",
      "Java",
      "JavaScript",
      "Jenkins",
      "Keras",
      "Kotlin",
      "Kubernetes",
      "Laravel",
      "Leadership",
      "Linux",
      "ML Models",
      "Machine Learning",
      "Matplotlib",
      "Microservices",
      "MongoDB",
      "MySQL",
      "Network Security",
      "Neural Networks",
      "Next.js",
      "NoSQL",
      "Node.js",
      "Notion",
      "NumPy",
      "OWASP",
      "PHP",
      "Pandas",
      "Penetration Testing",
      "PostgreSQL",
      "Power BI",
      "Project Management",
      "Problem Solving",
      "PyTorch",
      "Python",
      "REST API",
      "React",
      "Ruby",
      "Ruby on Rails",
      "Rust",
      "S3",
      "SQL",
      "Scala",
      "Scikit-learn",
      "Scrum",
      "Seaborn",
      "Software Development",
      "Spring Boot",
      "Swift",
      "System Design",
      "Tableau",
      "Teamwork",
      "TensorFlow",
      "Terraform",
      "Testing",
      "Troubleshooting",
      "TypeScript",
      "UML",
      "VS Code",
      "Vue.js"
    ];

    const normalizedAvailableSkills = availableSkills.map(skill => skill.toLowerCase());

    const toggleSkill = (skillName) => {
      setSkills((prev) => {
        const newSkills = { ...prev };
        if (newSkills[skillName]) {
          delete newSkills[skillName];
        } else {
          newSkills[skillName] = 1;
        }
        return newSkills;
      });
    };

    const changeExperience = (skillName, amount) => {
      setSkills((prev) => ({
        ...prev,
        [skillName]: Math.max(1, (prev[skillName] || 1) + amount)
      }));
    };

    const removeLocationAtIndex = (index) => {
      const updated = [...selectedLocations];
      updated.splice(index, 1);
      setSelectedLocations(updated);
    };
    const saveAllPreferencesToBackend = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const updatedData = {
            skills: skillsList
              .filter(skill => skill.name.trim() !== '')
              .map(skill => ({
                name: skill.name.toLowerCase(),
                experience: skill.experience
              })),

          locations: selectedLocations.filter(loc => loc !== ""),
          remote: isRemotePreferred,
          employmentType,
            salaryMin,
            salaryMax
        };
        console.log("Payload envoyé :", updatedData);

        await axios.put(`http://localhost:8080/jobsearchers/${userId}/updateUser`, updatedData, {
          headers
        });

        setSkillsSuccess(true);
        setLocationSuccess(true);
        setRemoteSuccess(true);

        setTimeout(() => {
          setSkillsSuccess(false);
          setLocationSuccess(false);
          setRemoteSuccess(false);
        }, 3000);

      } catch (err) {
        console.error("Erreur globale d'enregistrement :", err);
      }
    };

    const saveSkillsToBackend = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');
        const formattedSkills = skillsList.filter(s => s.name !== '');

        await axios.put(`http://localhost:8080/jobsearchers/${userId}/updateUser`, {
          skills: formattedSkills
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setSkillsSuccess(true);
        setTimeout(() => setSkillsSuccess(false), 3000);

      } catch (err) {
        console.error("Erreur mise à jour skills", err);
      }
    };
    const categories = [
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
      "Other"
    ];


    const savePreferencesToBackend = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userId = await AsyncStorage.getItem('userId');

            console.log("Envoi des préférences à l'API...");
            console.log("UserID :", userId);
            console.log("Catégories enregistrées :", tempSelectedCategories);

            const response = await axios.put(
                `http://localhost:8080/users/${userId}/preferences`,
                { preferredCategories: tempSelectedCategories },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );

            console.log("Réponse API :", response.data);

            setSelectedCategories([...tempSelectedCategories]);
            alert("Vos préférences ont été enregistrées avec succès !");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des préférences :", error);
        }
    };

    const saveLocationToBackend = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        await axios.put(`http://localhost:8080/jobsearchers/${userId}/updateUser`, {
          locations: selectedLocations.filter(loc => loc !== "") // retire les vides
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setLocationSuccess(true);
        setTimeout(() => setLocationSuccess(false), 3000);
      } catch (err) {
        console.error("Erreur enregistrement localisation :", err);
      }
    };

    const saveRemoteToBackend = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        await axios.put(`http://localhost:8080/jobsearchers/${userId}/updateUser`, {
          remote: isRemotePreferred
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setRemoteSuccess(true);
        setTimeout(() => setRemoteSuccess(false), 3000);

      } catch (err) {
        console.error("Erreur télétravail:", err);
      }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const storedCategories = await AsyncStorage.getItem('selectedCategories');
            if (storedCategories) {
                setSelectedCategories(JSON.parse(storedCategories));
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchUserPreferences = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const userId = await AsyncStorage.getItem('userId');

                if (!token || !userId) {
                    console.error("No token or userId found");
                    return;
                }

                console.log("Récupération des préférences utilisateur...");

                const response = await axios.get(`http://localhost:8080/users/id/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const userData = response.data;
                console.log("Données utilisateur récupérées :", userData);

                if (userData.preferredCategories) {
                    console.log("Préférences chargées :", userData.preferredCategories);
                    setSelectedCategories(userData.preferredCategories);
                    setTempSelectedCategories(userData.preferredCategories);
                } else {
                    console.warn("Aucune préférence trouvée en base.");
                }
                if (userData.locations && Array.isArray(userData.locations)) {
                    setSelectedLocations(userData.locations);  // Pré-sélectionner les localisations
                  }
                setIsLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des préférences :", error);
                setIsLoading(false);
            }
        };

        fetchUserPreferences();
    }, [navigation]);

    useEffect(() => {
        const fetchUserType = async () => {
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);
        };

        const fetchUserInfo = async () => {
            const token = await AsyncStorage.getItem('userToken');
            const username = await AsyncStorage.getItem('username');
            const userId = await AsyncStorage.getItem('userId');
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);

            console.log('Token récupéré:', token);
            console.log("Nom d'utilisateur récupéré:", username);

            if (!token || !username || !userId) {
              throw new Error('Token, username ou userId manquant');
            }

            const bearerToken = `${token}`;

            const userResponse = await axios.get(`http://localhost:8080/users/${username}`, {
              headers: {
                Authorization: bearerToken,
              },
            });

            const userData = userResponse.data;
            setUserInfo(userData);
            console.log("Infos User:", userData);

            try {
              const jobSearcherRes = await axios.get(`http://localhost:8080/jobsearchers/${userId}`, {
                headers: { Authorization: bearerToken }
              });
              const jobSearcher = jobSearcherRes.data;

                if (jobSearcher.salaryMin) {
                  setSalaryMin(jobSearcher.salaryMin);
                }
                if (jobSearcher.salaryMax) {
                  setSalaryMax(jobSearcher.salaryMax);
                }

              console.log("Compétences reçues depuis JobSearcher:", jobSearcher.skills);

              if (jobSearcher.skills && Array.isArray(jobSearcher.skills)) {
                  const formatted = {};
                  jobSearcher.skills.forEach(skill => {
                    if (skill.name) {
                      formatted[skill.name] = skill.experience || 1;
                    }
                  });
                  setSkills(formatted);
                  if (jobSearcher.skills && Array.isArray(jobSearcher.skills)) {
                    const formatted = {};
                    const skillsArr = [];

                    jobSearcher.skills.forEach(skill => {
                      if (skill.name) {
                        formatted[skill.name] = skill.experience || 1;
                        skillsArr.push({
                          name: skill.name,
                          experience: skill.experience || 1,
                        });
                      }
                    });

                    setSkills(formatted);
                    setSkillsList(skillsArr); // 🔥 Remplit le formulaire avec les compétences existantes
                  }

                }
                if (jobSearcher.locations && Array.isArray(jobSearcher.locations)) {
                    setSelectedLocations(jobSearcher.locations);
                  }

                  if (typeof jobSearcher.remote === 'boolean') {
                    setIsRemotePreferred(jobSearcher.remote);
                  }
                    if (jobSearcher.employmentType) {
                      setEmploymentType(jobSearcher.employmentType);
                    }

            } catch (error) {
              console.error("Erreur lors de la récupération des compétences JobSearcher:", error);
            }
          };

        fetchUserType();
        fetchUserInfo();
    }, [navigation]);

    const updateLocationAtIndex = (index, newValue) => {
      const updated = [...selectedLocations];
      updated[index] = newValue;
      setSelectedLocations(updated);
    };
    const addNewLocation = () => {
      setSelectedLocations([...selectedLocations, ""]);
    };

    const toggleCategory = (category) => {
        let updatedCategories = [...tempSelectedCategories];

        if (updatedCategories.includes(category)) {
            updatedCategories = updatedCategories.filter(item => item !== category);
        } else {
            updatedCategories.push(category);
        }

        setTempSelectedCategories(updatedCategories);
        setSelectedCategories(updatedCategories);
    };


    const handleSignOut = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('userType');
            navigation.navigate('SignIn');
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    const navigateToOffersPage = () => {
        if (userType === 'INDIVIDUAL') {
            navigation.navigate('MyJobMatchesPage');
        } else if (userType === 'COMPANY') {
            navigation.navigate('MyCompanyOffersPage');
        }
    };

    if (!userInfo) {
        return <Text>Loading...</Text>;
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scroll}>
        <View style={styles.topButtons}>
          <TouchableOpacity style={[styles.navButton, { backgroundColor: '#3b82f6' }]} onPress={() => navigation.navigate('ProfilePage')}>
            <Text style={styles.navButtonText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navButton, { backgroundColor: '#60a5fa' }]} onPress={() => navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome')}>
            <Text style={styles.navButtonText}>Main Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => {
              setUnreadCount(0); // on cache la pastille
              navigation.navigate("ChatPage");
            }}
          >
            <Text style={styles.buttonText}>Chat</Text>
            {unreadCount > 0 && (
              <View style={styles.dot} />
            )}

          </TouchableOpacity>

          {userType === 'INDIVIDUAL' && (
            <TouchableOpacity style={[styles.navButton, { backgroundColor: '#dbeafe' }]} onPress={() => navigation.navigate('LikedOffersPage')}>
              <Text style={styles.navButtonText}>Liked Offers</Text>
            </TouchableOpacity>
          )}

          {userType === 'COMPANY' && (
            <>

              <TouchableOpacity style={[styles.navButton, { backgroundColor: '#c7d2fe' }]} onPress={() => navigation.navigate('MyOffersPage')}>
                <Text style={styles.navButtonText}>My Offers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: '#dbeafe' }]}
                onPress={() => navigation.navigate('LikedCandidatesPage')}
              >
                <Text style={styles.navButtonText}>Liked Candidates</Text>
              </TouchableOpacity>

            </>
          )}
        </View>


        {userType === 'INDIVIDUAL' && (
          <>
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Offres recherchées</Text>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <CheckBox
                    key={category}
                    title={category}
                    checked={selectedCategories.includes(category)}
                    onPress={() => toggleCategory(category)}
                    containerStyle={styles.checkboxContainer}
                    textStyle={styles.checkboxText}
                    checkedColor="#4CAF50"
                  />
                ))}
              </View>
              <Button title="Enregistrer les préférences" onPress={savePreferencesToBackend} />
            </View>

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

              <TouchableOpacity onPress={addSkillRow} style={{ marginBottom: 10 }}>
                <Text style={{ color: '#007bff', textAlign: 'center' }}>+ Ajouter une compétence</Text>
              </TouchableOpacity>
            </View>


            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>Localisation préférée</Text>

              {selectedLocations.map((loc, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Picker
                    selectedValue={loc}
                    onValueChange={(value) => updateLocationAtIndex(index, value)}
                    style={{ flex: 1, height: 50 }}
                  >
                    <Picker.Item label="Sélectionner une ville" value="" />
                    {allCities.map((city, i) => (
                      <Picker.Item key={i} label={city} value={city} />
                    ))}
                  </Picker>

                  <TouchableOpacity onPress={() => removeLocationAtIndex(index)} style={{ marginLeft: 10 }}>
                    <Ionicons name="trash-outline" size={24} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity onPress={addNewLocation} style={{ marginBottom: 10 }}>
                <Text style={{ color: '#007bff', textAlign: 'center' }}>+ Ajouter une localisation</Text>
              </TouchableOpacity>
            </View>



            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>Télétravail accepté ?</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <TouchableOpacity
                  style={[styles.toggleButton, isRemotePreferred && styles.toggleButtonSelected]}
                  onPress={() => setIsRemotePreferred(true)}
                >
                  <Text style={isRemotePreferred ? styles.toggleTextSelected : styles.toggleText}>Oui</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleButton, !isRemotePreferred && styles.toggleButtonSelected]}
                  onPress={() => setIsRemotePreferred(false)}
                >
                  <Text style={!isRemotePreferred ? styles.toggleTextSelected : styles.toggleText}>Non</Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.sectionTitle}>Quel type de contrat cherches-tu ?</Text>
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
                {employmentTypeSuccess && (
                  <Text style={{ color: "green", marginTop: 6 }}>✅ Contrat préféré enregistré !</Text>
                )}
              </View>
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.sectionTitle}>Salaire souhaité</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
                    <View>
                      <Text style={styles.defaultText}>Minimum :</Text>
                      <View style={styles.experienceContainer}>
                        <TouchableOpacity onPress={() => setSalaryMin((prev) => Math.max(0, prev - 1000))}>
                          <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
                        </TouchableOpacity>
                        <Text style={styles.experienceValue}>{salaryMin} €</Text>
                        <TouchableOpacity onPress={() => setSalaryMin((prev) => prev + 1000)}>
                          <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View>
                      <Text style={styles.defaultText}>Maximum :</Text>
                      <View style={styles.experienceContainer}>
                        <TouchableOpacity onPress={() => setSalaryMax((prev) => Math.max(0, prev - 1000))}>
                          <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
                        </TouchableOpacity>
                        <Text style={styles.experienceValue}>{salaryMax} €</Text>
                        <TouchableOpacity onPress={() => setSalaryMax((prev) => prev + 1000)}>
                          <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

        <View style={{ marginTop: 20 }}>
          <Button title="💾 Enregistrer mes préférences" onPress={saveAllPreferencesToBackend} />
          {(skillsSuccess || remoteSuccess || locationSuccess) && (
            <Text style={{ color: 'green', marginTop: 6 }}>
              ✅ Préférences mises à jour avec succès !
            </Text>
          )}
        </View>

            </View>
          </>
        )}

        <View style={styles.content}>
          <Image source={{ uri: 'https://example.com/photo.jpg' }} style={styles.photo} />
          <Text style={styles.defaultText}>{userInfo.username ?? "Nom indisponible"}</Text>

          <Text style={styles.defaultText}>{userInfo.email}</Text>
          <Text style={styles.defaultText}>{userInfo.userType}</Text>
          <Text style={styles.defaultText}>Certification: {userInfo.companyCertified ? 'Certified' : 'Not Certified'}</Text>

          <Button title="EDIT" onPress={() => navigation.navigate('EditProfilePage')} />
          <Button title="SETTINGS" onPress={() => navigation.navigate('SettingsPage')} />
        </View>

        <View style={styles.footer}>
          <Button title="SIGN OUT" onPress={handleSignOut} />
        </View>
      </ScrollView>
    );

};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0f172a',
    },
    topButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
      marginTop: 20,
      marginBottom: 20,
    },
    categorySection: {
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#ffffff',
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
        categoryBox: {
            backgroundColor: '#f0f0f0',
            padding: 10,
            borderRadius: 8,
            margin: 5,
    },
    categorySelected: {
        backgroundColor: '#4CAF50',
    },
    categoryText: {
        fontSize: 14,
        color: '#ffffff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    infoText: {
        textAlign: 'center',
        marginBottom: 20,
        color: '#ffffff',
    },
    footer: {
        justifyContent: 'flex-end',
        marginBottom: 36,
        alignItems: 'center',
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
      color: '#ffffff',
    },
    defaultText: {
      color: '#ffffff',
    }
,

scroll: {
  flex: 1,
  backgroundColor: '#0f172a',
},
scrollContainer: {
  paddingBottom: 100,
  paddingHorizontal: 10,
  backgroundColor: '#0f172a',
},
bottomActions: {
  padding: 10,
  borderTopWidth: 1,
  borderColor: '#ddd',
  backgroundColor: '#fff',
  gap: 10,
},
toggleButton: {
  padding: 10,
  marginHorizontal: 10,
  borderWidth: 2,
  borderColor: '#007bff',
  borderRadius: 8,
  width: 80,
  alignItems: 'center',
},
toggleButtonSelected: {
  backgroundColor: '#007bff',
},
toggleText: {
  color: '#007bff',
  fontWeight: 'bold',
},
toggleTextSelected: {
  color: 'white',
  fontWeight: 'bold',
},
navButton: {
  backgroundColor: '#1e3a8a',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 3,
},
navButtonText: {
  color: '#ffffff',
  fontWeight: 'bold',
  textAlign: 'center',
},
chatButton: {
  position: 'relative',
  backgroundColor: '#3b82f6',
  padding: 14,
  borderRadius: 10,
  alignItems: 'center',
},
badge: {
  position: 'absolute',
  top: -5,
  right: -10,
  backgroundColor: 'red',
  borderRadius: 10,
  paddingHorizontal: 6,
  paddingVertical: 2,
},
badgeText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 10,
},
dot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: 'red',
  position: 'absolute',
  top: -5,
  right: -10,
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
contractContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginBottom: 10,
},
skillContainer: {
  marginBottom: 10,
}

});

export default ProfilePage;
