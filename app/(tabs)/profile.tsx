import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Avatar, Text, Card, TextInput, IconButton, Chip, RadioButton, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { getUserProfile, updateUserProfileField, updateUserProfileFields, listenToUserProfile } from '../../services/profileService.js';
import { auth, storage } from '../../config/firebaseConfig';
import { useRouter } from 'expo-router';

const CustomButton = (props) => {
  const [pressed, setPressed] = useState(false);
  const { mode, style, onPressIn, onPressOut, ...rest } = props;
  if (mode === 'contained') {
    return (
      <Button
        {...rest}
        mode={mode}
        style={style}
        onPressIn={(e) => {
          setPressed(true);
          onPressIn && onPressIn(e);
        }}
        onPressOut={(e) => {
          setPressed(false);
          onPressOut && onPressOut(e);
        }}
        buttonColor={pressed ? 'rgb(224,114,109)' : 'rgb(255,189,194)'}
      >
        {props.children}
      </Button>
    );
  } else {
    return (
      <Button
        {...rest}
        mode={mode}
        style={[style, { borderColor: pressed ? 'rgb(224,114,109)' : 'rgb(255,189,194)' }]}
        onPressIn={(e) => {
          setPressed(true);
          onPressIn && onPressIn(e);
        }}
        onPressOut={(e) => {
          setPressed(false);
          onPressOut && onPressOut(e);
        }}
        textColor={pressed ? 'rgb(224,114,109)' : 'rgb(255,189,194)'}
      >
        {props.children}
      </Button>
    );
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editingStudies, setEditingStudies] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [degree, setDegree] = useState('');
  const [university, setUniversity] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [customGender, setCustomGender] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newSociety, setNewSociety] = useState('');
  const recommendedInterests = ['Reading', 'Music', 'Sports', 'Travel', 'Coding', 'Cooking'];
  useEffect(() => {
    const unsubscribe = listenToUserProfile((data) => {
      setUser(data);
      setDegree(data.degree || '');
      setUniversity(data.university || '');
      setBio(data.bio || '');
      setGender(data.gender || '');
      setCustomGender(data.customGender || '');
    });
    return () => unsubscribe();
  }, []);
  const handleSaveStudies = async () => {
    await updateUserProfileFields({ degree, university });
    setEditingStudies(false);
  };
  const handleSaveBio = async () => {
    await updateUserProfileField('bio', bio);
    setEditingBio(false);
  };
  const handleGenderChange = async (value) => {
    setGender(value);
    await updateUserProfileField('gender', value);
  };
  const handleCustomGenderChange = async (value) => {
    setCustomGender(value);
    await updateUserProfileField('customGender', value);
  };
  const handleAddItem = async (field, value) => {
    if (!value.trim()) return;
    const list = user[field] || [];
    if (list.includes(value)) return;
    const updated = [...list, value];
    await updateUserProfileField(field, updated);
  };
  const handleRemoveItem = async (field, value) => {
    const list = user[field] || [];
    const updated = list.filter((item) => item !== value);
    await updateUserProfileField(field, updated);
  };
  const handleAvatarPress = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission denied');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const image = result.assets[0];
      const blob = await (await fetch(image.uri)).blob();
      const filename = `avatars/${auth.currentUser.uid}_${uuidv4()}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      await updateUserProfileField('avatarUrl', downloadUrl);
    }
  };
  if (!user) return null;
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={styles.avatarRow}>
        <Avatar.Image
          size={80}
          source={user.avatarUrl ? { uri: user.avatarUrl } : require('../../assets/images/default_avatar.png')}
          style={{ backgroundColor: 'white' }}
        />
        <IconButton icon="camera" onPress={handleAvatarPress} />
        <Text style={styles.welcome}>Welcome Back, <Text style={{ fontWeight: 'bold' }}>{user.name}</Text>!</Text>
      </View>
      <Card style={styles.card}>
        <Card.Title title="My Studies" titleStyle={{ fontWeight: 'bold', color: "gray" }} right={() => <IconButton icon="pencil" onPress={() => setEditingStudies(!editingStudies)} />} />
        <Card.Content>
          {editingStudies ? (
            <>
              <TextInput label="Degree" value={degree} onChangeText={setDegree} mode="outlined" style={styles.input} outlineColor="rgb(255,189,194)" activeOutlineColor="rgb(224,114,109)" />
              <TextInput label="University" value={university} onChangeText={setUniversity} mode="outlined" style={styles.input} outlineColor="rgb(255,189,194)" activeOutlineColor="rgb(224,114,109)" />
              <CustomButton mode="contained" onPress={handleSaveStudies} style={styles.button}>Save</CustomButton>
            </>
          ) : (
            <>
              <Text style={{ color: "gray" }}>{degree}</Text>
              <Text style={{ color: "gray" }}>{university}</Text>
            </>
          )}
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title title="About Me" titleStyle={{ fontWeight: 'bold' , color: "gray"}} right={() => <IconButton icon="pencil" onPress={() => setEditingBio(!editingBio)} />} />
        <Card.Content>
          {editingBio ? (
            <>
              <TextInput label="Biography" value={bio} onChangeText={setBio} mode="outlined" multiline numberOfLines={4} style={styles.input} outlineColor="rgb(255,189,194)" activeOutlineColor="rgb(224,114,109)" />
              <CustomButton mode="contained" onPress={handleSaveBio} style={styles.button}>Save</CustomButton>
            </>
          ) : (
            <Text style={{ color: "gray" }}>{bio || 'No biography yet.'}</Text>
          )}
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title title="Gender" titleStyle={{ fontWeight: 'bold', color: "gray" }}/>
        <Card.Content>
        <RadioButton.Group onValueChange={handleGenderChange} value={gender}>
          <RadioButton.Item label="Male" value="Male" color="rgb(224,114,109)" labelStyle={{ color: 'grey' }} />
          <RadioButton.Item label="Female" value="Female" color="rgb(224,114,109)" labelStyle={{ color: 'grey' }} />
          <RadioButton.Item label="Prefer not to say" value="Prefer not to say" color="rgb(224,114,109)" labelStyle={{ color: 'grey' }} />
          <RadioButton.Item label="Not included" value="Not included" color="rgb(224,114,109)" labelStyle={{ color: 'grey' }} />
        </RadioButton.Group>

          {gender === 'Not included' && (
            <TextInput label="Custom Gender" value={customGender} onChangeText={handleCustomGenderChange} mode="outlined" style={styles.input} outlineColor="rgb(255,189,194)" activeOutlineColor="rgb(224,114,109)" />
          )}
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title title="My Interests" titleStyle={{ fontWeight: 'bold', color: "gray" }} />
        <Card.Content>
          <TextInput
            placeholder="Add new interest"
            value={newInterest}
            onChangeText={setNewInterest}
            onSubmitEditing={() => {
              handleAddItem('interests', newInterest);
              setNewInterest('');
            }}
            mode="outlined"
            style={styles.input}
            outlineColor="rgb(255,189,194)"
            activeOutlineColor="rgb(224,114,109)"
          />
          <View style={styles.recommendWrap}>
            {recommendedInterests.map((item) => (
              <Chip key={item} style={styles.recommendChip} textStyle={{color: "white"}} onPress={() => handleAddItem('interests', item)}>
                {item}
              </Chip>
            ))}
          </View>
          <View style={styles.chipWrap}>
            {(user.interests || []).map((item) => (
              <Chip key={item} style={styles.chip} textStyle={{color: "white"}} onClose={() => handleRemoveItem('interests', item)}>
                {item}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title title="My Societies" titleStyle={{ fontWeight: 'bold', color: "gray" }}/>
        <Card.Content>
          <TextInput
            placeholder="Add new society"
            value={newSociety}
            onChangeText={setNewSociety}
            onSubmitEditing={() => {
              handleAddItem('societies', newSociety);
              setNewSociety('');
            }}
            mode="outlined"
            style={styles.input}
            outlineColor="rgb(255,189,194)"
            activeOutlineColor="rgb(224,114,109)"
          />
          <View style={styles.chipWrap}>
            {(user.societies || []).map((item) => (
              <Chip key={item} style={styles.chip} onClose={() => handleRemoveItem('societies', item)}>
                {item}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
      <CustomButton
        mode="outlined"
        onPress={async () => {
          try {
            await auth.signOut();
            Alert.alert('Logged Out', 'You have been signed out.');
            router.replace('/register');
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to log out.');
          }
        }}
        style={styles.logoutButton}
      >
        <Text style={{ color: 'rgba(0, 0, 0, 0.76)' }}>Logout</Text>
      </CustomButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleBold: {
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
    backgroundColor: 'rgb(255,237,237)',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  welcome: {
    fontSize: 20,
    flexShrink: 1,
  },
  card: {
    backgroundColor: 'rgb(251,221,219)',
    marginBottom: 16,
    borderRadius: 16,
  },
  input: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  recommendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  recommendChip: {
    backgroundColor: 'rgb(247,194,196)',
    margin: 4,
  },
  chip: {
    backgroundColor: 'rgb(247,194,196)',
    margin: 4,
  },
  button: {
    backgroundColor: 'rgb(247,194,196)',
    marginTop: 8,
    borderRadius: 8,
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: 'rgb(247,194,196)',
    borderColor: 'rgb(227,154,150)',
    borderWidth: 1,
  }
});
