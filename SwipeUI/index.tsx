// app/(tabs)/index.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, Image } from 'react-native';
import { Text, View, Chip } from 'react-native-paper';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { getCandidateProfile, handleSwipeRight } from '@/services/swipeService';
import defaultAvatar from '@/assets/images/default_avatar.png';
import { auth } from '@/config/firebaseConfig';
import { useRouter } from 'expo-router';

export default function SwipeScreen() {
  const [user, setUser] = useState<any>({
    name: 'Test User',
    age: 20,
    degree: 'Computer Science',
    university: 'UCL',
    avatarUrl: '',
    interests: ['Reading', 'Coding', 'Gaming'],
    uid: 'dummy_uid_123'
  });

  const router = useRouter(); 
  const translationX = useSharedValue(0);

  const fetchNextUser = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const profile = await getCandidateProfile(uid);
    setUser(profile);
  };

  useEffect(() => {
    fetchNextUser();
  }, []);

  const onSwipeRight = async () => {
    const uid = auth.currentUser?.uid;
    if (uid && user?.uid) {
      await handleSwipeRight(uid, user.uid);
    }
    runOnJS(fetchNextUser)();
  };

  const onSwipeLeft = () => {
    runOnJS(fetchNextUser)();
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translationX.value = event.translationX;
    })
    .onEnd(() => {
      if (translationX.value > 120) {
        runOnJS(onSwipeRight)();
      } else if (translationX.value < -120) {
        runOnJS(onSwipeLeft)();
      }
      translationX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }],
  }));

  if (!user) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.card, animatedStyle]}
          onTouchEnd={() => {
            if (user?.uid) {
              router.push({
                pathname: '/userDetail',
                params: { uid: user.uid }
              });
            }
          }}
        >
          <Image
            source={user.avatarUrl ? { uri: user.avatarUrl } : defaultAvatar}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.name}, {user.age || '??'}</Text>
          <Text style={styles.degree}>{user.degree}，{user.university}</Text>
          <View style={styles.interests}>
            {(user.interests || []).slice(0, 3).map((interest: string, index: number) => (
              <Chip key={index} style={styles.chip}>{interest}</Chip>
            ))}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(255, 237, 237)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 300,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgb(255, 255, 255)',
    alignItems: 'center',
    elevation: 4,
  },
  avatar: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'rgb(30, 30, 30)',
    marginBottom: 8,
  },
  degree: {
    fontSize: 16,
    color: 'rgb(100, 100, 100)',
    marginBottom: 16,
    textAlign: 'center',
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    margin: 4,
    backgroundColor: 'rgb(227,154,150)',
  },
}); 