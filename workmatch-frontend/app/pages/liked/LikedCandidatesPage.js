import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import SockJS from 'sockjs-client';

const LikedCandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const [userType, setUserType] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
      const connectWebSocket = async () => {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        console.log("Connexion WebSocket depuis LikedCandidatesPage");

        const socket = new SockJS('http://localhost:8080/ws');
        const stomp = Stomp.over(socket);
        stomp.debug = null;

        stomp.connect({}, () => {
          console.log("✅ WebSocket connecté dans LikedCandidatesPage");
          stomp.subscribe(`/topic/notifications/${userId}`, (message) => {
            const msg = JSON.parse(message.body);
            console.log('🔔 Notification reçue (likedCandidatesPage) :', msg);
            setUnreadCount((prev) => {
                const newCount = prev + 1;
                AsyncStorage.setItem('unreadMessageCount', newCount.toString());
                return newCount;
              });
          });
        }, (err) => {
          console.error("Erreur WebSocket LikedCandidatesPage:", err);
        });
      };

      connectWebSocket();
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

        console.log("Candidats likés :", response.data);
        setCandidates(response.data);
      } catch (error) {
        console.error("Erreur candidats likés :", error);
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

        console.log("Candidats likés :", response.data);
        setCandidates(response.data);
      } catch (error) {
        console.error("Erreur candidats likés :", error);
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

                <TouchableOpacity
                  style={[styles.navButton, { backgroundColor: '#93c5fd', position: 'relative' }]}
                  onPress={() => {
                    setUnreadCount(0); // reset
                    navigation.navigate('ChatPage');
                  }}
                >
                  <Text style={styles.navButtonText}>Chat</Text>
                  {unreadCount > 0 && (
                    <View style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      backgroundColor: 'red',
                      borderRadius: 10,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10 }}>{unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navButton, { backgroundColor: '#bfdbfe' }]} onPress={() => navigation.navigate('MyOffersPage')}>
                  <Text style={styles.navButtonText}>My Offers</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navButton, { backgroundColor: '#dbeafe' }]} onPress={() => navigation.navigate('LikedCandidatesPage')}>
                  <Text style={styles.navButtonText}>Liked Candidates</Text>
                </TouchableOpacity>
              </View>
            )}
      <Text style={styles.pageTitle}>Candidats Likés</Text>

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
