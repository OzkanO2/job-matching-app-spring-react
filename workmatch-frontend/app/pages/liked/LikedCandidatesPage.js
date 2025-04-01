import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const LikedCandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const [userType, setUserType] = useState('');

useEffect(() => {
    const fetchData = async () => {
      const type = await AsyncStorage.getItem('userType');
      setUserType(type);

      try {
        const token = await AsyncStorage.getItem("userToken");
        const companyId = await AsyncStorage.getItem("userId");

        const response = await axios.get(`http://localhost:8080/likes/liked-candidates/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("💙 Candidats likés :", response.data);
        setCandidates(response.data);
      } catch (error) {
        console.error("❌ Erreur candidats likés :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchLikedCandidates = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const companyId = await AsyncStorage.getItem("userId");

        const response = await axios.get(`http://localhost:8080/likes/liked-candidates/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("💙 Candidats likés :", response.data);
        setCandidates(response.data);
      } catch (error) {
        console.error("❌ Erreur candidats likés :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedCandidates();
  }, []);

  const renderCandidate = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('LikedCandidateDetailsPage', { candidate: item })}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.info}>{item.locations?.join(', ') || "Localisation inconnue"}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
       {/* Boutons de navigation */}
            {userType === 'COMPANY' && (
              <View style={styles.topButtons}>
                <TouchableOpacity style={[styles.navButton, { backgroundColor: '#3b82f6' }]} onPress={() => navigation.navigate('ProfilePage')}>
                  <Text style={styles.navButtonText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navButton, { backgroundColor: '#60a5fa' }]} onPress={() => navigation.navigate('CompanyHome')}>
                  <Text style={styles.navButtonText}>Main Menu</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navButton, { backgroundColor: '#93c5fd' }]} onPress={() => navigation.navigate('ChatPage')}>
                  <Text style={styles.navButtonText}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navButton, { backgroundColor: '#bfdbfe' }]} onPress={() => navigation.navigate('MyOffersPage')}>
                  <Text style={styles.navButtonText}>My Offers</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navButton, { backgroundColor: '#dbeafe' }]} onPress={() => navigation.navigate('LikedCandidatesPage')}>
                  <Text style={styles.navButtonText}>Liked Candidates</Text>
                </TouchableOpacity>
              </View>
            )}
      <Text style={styles.pageTitle}>👥 Candidats Likés</Text>

      {isLoading ? (
        <Text style={styles.loading}>Chargement...</Text>
      ) : candidates.length === 0 ? (
        <Text style={styles.loading}>Aucun candidat liké.</Text>
      ) : (
        <FlatList
          data={candidates}
          keyExtractor={(item) => item.userId}
          renderItem={renderCandidate}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  topButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
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
    marginHorizontal: 4,
    marginBottom: 10,
  },
  navButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pageTitle: { fontSize: 20, color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  loading: { color: 'white', textAlign: 'center' },
  card: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  name: { fontSize: 16, color: 'white', fontWeight: 'bold' },
  info: { color: 'white' },
});
export default LikedCandidatesPage;
