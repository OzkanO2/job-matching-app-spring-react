
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const LikedOffersPage = () => {
  const [likedOffers, setLikedOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchLikedOffers = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const userId = await AsyncStorage.getItem("userId");

        const response = await axios.get(`http://localhost:8080/likes/liked-offers/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("📋 Offres likées :", response.data);
        setLikedOffers(response.data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des offres likées :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedOffers();
  }, []);

  const renderOffer = ({ item }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => navigation.navigate('JobOfferDetails', { offer: item })}
    >
      <Text style={styles.offerTitle}>{item.title}</Text>
      <Text style={styles.offerDetails}>{item.description?.slice(0, 100)}...</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
    <View style={styles.topButtons}>
      <TouchableOpacity style={[styles.navButton, { backgroundColor: '#3b82f6' }]} onPress={() => navigation.navigate('ProfilePage')}>
        <Text style={styles.navButtonText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.navButton, { backgroundColor: '#60a5fa' }]} onPress={() => navigation.navigate('IndividualHome')}>
        <Text style={styles.navButtonText}>Main Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.navButton, { backgroundColor: '#93c5fd' }]} onPress={() => navigation.navigate('ChatPage')}>
        <Text style={styles.navButtonText}>Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.navButton, { backgroundColor: '#bfdbfe' }]} onPress={() => navigation.navigate('LikedOffersPage')}>
        <Text style={styles.navButtonText}>Liked Offers</Text>
      </TouchableOpacity>
    </View>

      <Text style={styles.pageTitle}></Text>

      {isLoading ? (
        <Text style={styles.loadingText}>Chargement...</Text>
      ) : likedOffers.length === 0 ? (
        <Text style={styles.emptyText}>Aucune offre likée pour le moment.</Text>
      ) : (
        <FlatList
          data={likedOffers}
          keyExtractor={(item) => item._id}
          renderItem={renderOffer}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  pageTitle: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
      marginBottom: 10,
      alignSelf: 'flex-start',
      backgroundColor: '#1e3a8a',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  list: {
    paddingBottom: 16,
  },
  offerCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  offerTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  offerDetails: {
    color: 'white',
  },
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
    marginHorizontal: 5,
    marginBottom: 10,
  },
  navButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

});

export default LikedOffersPage;