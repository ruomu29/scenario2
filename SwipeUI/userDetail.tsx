// app/userDetail.tsx

import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text, View, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getUserProfile } from '@/services/swipeService';
import defaultAvatar from '@/assets/images/default_avatar.png';

export default function UserDetail() {
  const { uid } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (uid) {
      getUserProfile(uid as string).then(setUser).catch(console.error);
    }
  }, [uid]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Loading user...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => router.replace('/(tabs)/index')}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={user.avatarUrl ? { uri: user.avatarUrl } : defaultAvatar}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}, {user.age || '??'}</Text>
        <Text style={styles.degree}>{user.degree}, {user.university}</Text>

        <Text style={styles.sectionLabel}>Bio</Text>
        <Text style={styles.bio}>{user.bio || 'No bio provided.'}</Text>

        {user.societies && user.societies.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Member of:</Text>
            <Text style={styles.societiesText}>
              {user.societies.join(', ')}
            </Text>
          </>
        )}

        <Text style={styles.sectionLabel}>Interests</Text>
        <View style={styles.chipContainer}>
          {(user.interests || []).map((item: string, idx: number) => (
            <Chip key={idx} style={styles.chip}>{item}</Chip>
          ))}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgb(255, 237, 237)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 220,
    height: 220,
    borderRadius: 20,
    marginBottom: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'rgb(30, 30, 30)',
    marginBottom: 6,
  },
  degree: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgb(80, 80, 80)',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgb(30, 30, 30)',
  },
  bio: {
    fontSize: 14,
    color: 'rgb(80, 80, 80)',
    marginTop: 8,
    textAlign: 'left',
  },
  societiesText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: 'rgb(120, 120, 120)',
    marginTop: 6,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  chip: {
    backgroundColor: 'rgb(255,189,194)',
    margin: 4,
  },
});
