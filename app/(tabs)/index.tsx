import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { getUsers } from '@/components/Users';
import { shuffleArray } from '@/components/shuffleArray';
import { useState, useEffect } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { getUserProfile } from '@/services/profileService';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { runOnJS } from 'react-native-reanimated';
import { db } from '@/config/firebaseConfig'; // Ensure correct path
import { collection, addDoc, Timestamp, DocumentData } from 'firebase/firestore';

export default function SwipeScreen() {
  interface User {
    id: string;
    name: string;
  }
  

  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIndex, setUserIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<any | undefined>(undefined);

  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  

  useEffect(() => {
    const getUserList = async () => {
      const userList = await shuffleArray(await getUsers());
      setUserList(userList);
      setLoading(false);
    };

    const getCurrentUser = async () => {
      const curUser = await getUserProfile();
      setCurrentUser(curUser);
    };

    getCurrentUser();
    getUserList();
  }, []);

  
  // Create a new chat in Firebase
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
    transform: [{ translateX: translationX.value }, { translateY: translationY.value }],
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
        <Text style={{ color: 'black' }} >No more users to show</Text>
      </GestureHandlerRootView>
    );
  }

  if (userIndex > -1) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.box, animatedStyle]}>
            <Text style={styles.nameFormat}>Name: {user.name}</Text>
            <Text style={styles.ageFormat}>Age: {user.age}</Text>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  } else {
    return (
      <GestureHandlerRootView style={styles.container}>
        <Text style={{ color: 'black' }} >No more users to show</Text>
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
    backgroundColor: 'rgb(247,194,196)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameFormat: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  ageFormat: {
    fontSize: 18,
    color: '#555',
  },
});

