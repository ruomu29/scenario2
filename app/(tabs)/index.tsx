import { Image, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { View } from 'react-native';
import { getUsers } from '@/components/Users';
import { shuffleArray } from '@/components/shuffleArray';
import { useState, useEffect } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { getUserProfile } from '@/services/profileService';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { runOnJS } from 'react-native-reanimated';
import { auth, db } from '@/config/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import React from 'react';
import defaultAvatar from '../../assets/images/default_avatar.png';

export default function SwipeScreen() {
  interface User {
    id: string;
    name: string;
  }

  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIndex, setUserIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<any | undefined>(undefined);
  const [showMoreModal, setShowMoreModal] = useState(false);

  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!auth.currentUser) {
          console.log('No user is logged in. Skipping swipe data load.');
          return;
        }

        const curUser = await getUserProfile();
        setCurrentUser(curUser);

        const allUsers = await getUsers();
        const filteredUsers = allUsers.filter(user => user.id !== curUser.uid);
        const shuffledUsers = shuffleArray(filteredUsers);

        setUserList(shuffledUsers);
      } catch (err) {
        console.error('Error initializing swipe data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const createNewChat = async (matchedUser: User) => {
    try {
      const chatRef = await addDoc(collection(db, 'chats'), {
        participants: [currentUser.uid, matchedUser.id],
        createdAt: Timestamp.now(),
        lastMessage: '',
        lastMessageTime: Timestamp.now(),
        name: matchedUser.name,
      });

      console.log('New chat created with ID:', chatRef.id);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleRightSwipe = (user: User) => {
    console.log('Liked:', user.name);
    createNewChat(user);
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translationX.value = event.translationX;
      translationY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationX > 150 || event.translationX < -150) {
        if (event.translationX > 150) {
          runOnJS(handleRightSwipe)(userList[userIndex]);
        }

        if (userIndex < userList.length - 1) {
          runOnJS(setUserIndex)(userIndex + 1);
        } else {
          runOnJS(setUserIndex)(-1);
        }
      }
      translationX.value = 0;
      translationY.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  const user = userList[userIndex];

  if (loading) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <Text style={{ color: 'black' }}>Loading...</Text>
      </GestureHandlerRootView>
    );
  }

  if (userList.length === 0) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <Text style={{ color: 'black' }}>No more users to show</Text>
      </GestureHandlerRootView>
    );
  }

  if (userIndex > -1) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.box, animatedStyle]}>
            <Image source={user.avatarUrl ? { uri: user.avatarUrl } : defaultAvatar} style={styles.avatarFormat} />
            {user.name && <Text style={styles.nameFormat}>{user.name}</Text>}
            {user.studies && <Text style={styles.studiesFormat}>{user.studies}</Text>}
            {user.bio && <Text style={styles.bioFormat}>{user.bio}</Text>}
            <Button mode="outlined" onPress={() => setShowMoreModal(true)} style={styles.viewButton} labelStyle={styles.viewButtonLabel}>View Full Profile</Button>
          </Animated.View>
        </GestureDetector>

        {showMoreModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Image source={user.avatarUrl ? { uri: user.avatarUrl } : defaultAvatar} style={styles.modalAvatar} />
                <Text style={styles.modalName}>{user.name}</Text>
                <Text style={styles.modalSection}>Studies</Text>
                <Text style={styles.modalText}>{user.studies || 'No studies provided.'}</Text>
                <Text style={styles.modalSection}>Bio</Text>
                <Text style={styles.modalText}>{user.bio || 'No bio provided.'}</Text>
                <Text style={styles.modalSection}>Interests</Text>
                <Text style={styles.modalText}>{user.interests && user.interests.length > 0 ? user.interests.join(', ') : 'No interests provided.'}</Text>
                <Text style={styles.modalSection}>Societies</Text>
                <Text style={styles.modalText}>{user.societies && user.societies.length > 0 ? user.societies.join(', ') : 'No societies provided.'}</Text>
              </ScrollView>
              <Button mode="contained" onPress={() => setShowMoreModal(false)} style={styles.closeButton}>Close</Button>
            </View>
          </View>
        )}
      </GestureHandlerRootView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(255,237,237)',
  },
  box: {
    width: 300,
    height: 600,
    paddingTop: 24,
    backgroundColor: 'rgb(247,194,196)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  avatarFormat: {
    width: 200,
    height: 200,
    borderRadius: 90,
    marginBottom: 20,
    marginTop: 40,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#f0f0f0',
  },
  nameFormat: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
  },
  studiesFormat: {
    fontSize: 20,
    color: '#555',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  bioFormat: {
    fontSize: 20,
    color: '#555',
    textAlign: 'center',
    marginVertical: 10,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 20,
    borderRadius: 30,
    backgroundColor: 'rgb(255,237,237)',
  },
  viewButtonLabel: {
    color: 'black',
    fontWeight: 500,
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    height: '80%',
    overflow: 'hidden',
  },
  modalAvatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
  },
  modalSection: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  modalText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  closeButton: {
    backgroundColor: 'rgb(224,114,109)',
    margin: 16,
    borderRadius: 12,
  },
});