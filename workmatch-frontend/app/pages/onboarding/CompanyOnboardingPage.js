import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CompanyOnboardingPage = ({ navigation, route }) => {
  const { userInfo } = route.params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
const [salaryMin, setSalaryMin] = useState(30000);
const [salaryMax, setSalaryMax] = useState(60000);
const [salaryError, setSalaryError] = useState('');

    const validateInputs = () => {
        const titleWithoutSpaces = title.replace(/\s/g, '');
        const descriptionWithoutSpaces = description.replace(/\s/g, '');
        let isValid = true;

        if (titleWithoutSpaces.length < 7) {
          setTitleError('Le titre doit contenir au moins 7 caractères (hors espaces).');
          isValid = false;
        } else {
          setTitleError('');
        }

        if (descriptionWithoutSpaces.length < 20) {
          setDescriptionError('La description doit contenir au moins 20 caractères (hors espaces).');
          isValid = false;
        } else {
          setDescriptionError('');
        }
if (salaryMin >= salaryMax) {
  setSalaryError("Le salaire minimum doit être inférieur au salaire maximum.");
  isValid = false;
} else {
  setSalaryError('');
}

        return isValid;
      };

   const handleSubmit = async () => {
    if (!validateInputs()) return;

       try {
         const token = await AsyncStorage.getItem('userToken');
         const companyId = userInfo.id;

         if (!title || !description) {
           Alert.alert("Champs requis", "Merci de remplir tous les champs.");
           return;
         }

         const newOffer = {
           title,
           description,
           companyId,
           salaryMin,
           salaryMax,
         };


         const response = await axios.post(
             'http://localhost:8080/joboffers',
             newOffer,
             {
               headers: {
                 Authorization: token,
                 'Content-Type': 'application/json',
               },
             }
           );

         if (response.status === 201 || response.status === 200) {
             Alert.alert("✅ Offre créée !", "Votre première offre a été enregistrée.");
             navigation.replace('CompanyHome');
           } else {
             Alert.alert("❌ Erreur", "Impossible de créer l’offre.");
           }
       } catch (error) {
         console.error('❌ Erreur lors de la création de l\'offre :', error);
         Alert.alert("Erreur", "Impossible de créer l'offre.");
       }
     };

 return (
     <View style={styles.container}>
       <Text style={styles.headerText}>Bienvenue, {userInfo.username} !</Text>
             <Text style={styles.subText}>Créez votre première offre, vous pourrez en créer d'autres par la suite.</Text>

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
                     <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
                   </TouchableOpacity>
                   <Text style={styles.salaryValue}>{salaryMin} €</Text>
                   <TouchableOpacity onPress={() => setSalaryMin((prev) => Math.min(prev + 1000, salaryMax - 1000))}>
                     <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
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


             <Button title="Soumettre l'offre" onPress={handleSubmit} />
           </View>
   );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 8,
    borderRadius: 5,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 13,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  }
,salaryContainer: {
   marginTop: 10,
   marginBottom: 10,
 },
 salaryControls: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   gap: 10,
 },
 salaryValue: {
   fontSize: 16,
   fontWeight: 'bold',
   marginHorizontal: 10,
 },

});
export default CompanyOnboardingPage;
