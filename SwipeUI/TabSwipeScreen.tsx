import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { getUsers } from '@/components/Users';
import { shuffleArray } from '@/components/shuffleArray';
import { useState, useEffect } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { runOnJS } from 'react-native-reanimated';

export default function SwipeScreen() {
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIndex, setUserIndex] = useState(0);

  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  useEffect(() => {
    const getUserList = async () => {
      const userList = await shuffleArray(await getUsers());
      setUserList(userList);
      setLoading(false);
    };
    getUserList();
  }, []);
  // Create a new chat in Firebase
  const createNewChat = async (matchedUser) => {
    try {
      // Create a new chat document
      const chatRef = await addDoc(collection(db, 'chats'), {
        participants: [currentUser.uid, matchedUser.id], // Add both user IDs
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        name: matchedUser.name, // You might want to customize this
      });
      
      console.log('New chat created with ID:', chatRef.id);
      // You could also show a notification or navigate to the chat
      
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };
  
  const handleRightSwipe = (user) => {
    console.log('Liked:', user.name);
    createNewChat(user);
  };
  
  const handleLeftSwipe = (user) => {
    console.log('Passed:', user.name);
    // Any left swipe logic here
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translationX.value = event.translationX;
      translationY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationX > 150 || event.translationX < -150) {
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
        <Text>Loading...</Text>
      </GestureHandlerRootView>
    );
  }

  if (userList.length === 0) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <Text>No more users to show</Text>
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
        <Text>No more users to show</Text>
      </GestureHandlerRootView>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 500,
    height: 200,
    backgroundColor: '#ffb5c0',
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
