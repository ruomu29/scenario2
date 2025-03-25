import { StyleSheet, Animated } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { getUsers } from '@/components/Users';
import { shuffleArray } from '@/components/shuffleArray';
import { useState, useEffect, useRef } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

export default function SwipeScreen() {
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIndex, setUserIndex] = useState(0);

  const translationX = useRef(new Animated.Value(0)).current
  const translationY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const getUserList = async () => {
      const userList = await shuffleArray(await getUsers());
      setUserList(userList);
      setLoading(false);
    }
    getUserList();
  }, []);

  // Taken from https://blog.logrocket.com/react-native-gesture-handler-tutorial-examples/
  const pan = Gesture.Pan().onUpdate((event) => {
      translationX.setValue(event.translationX)
      translationY.setValue(event.translationY)
  }).onEnd((event) => {
      if (event.translationX > 450 || event.translationX < -450) {
        if (userIndex < userList.length -1) {
          setUserIndex(userIndex + 1)
        } else {
          setUserIndex(-1)
        }
      }

      translationX.setValue(0);
      translationY.setValue(0);
  })

  const user = userList[userIndex];

  if (loading == true) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (userList.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No more users to show</Text>
      </View>
    );
  }

  if (userIndex > -1) {
    return (
      <View style={styles.container}>
        <GestureDetector gesture={pan}>
        <Animated.View
            style={[
              styles.box,
              {
                transform: [
                  { translateX: translationX },
                  { translateY: translationY },
                ],
              },
            ]}
          >
          <Text style ={styles.nameFormat}>Name: {user.name}</Text>
          <Text style ={styles.ageFormat}>Age: {user.age} </Text>
          </Animated.View>
  
        </GestureDetector>
      </View>
    );  
  } else {
    return (
      <View style={styles.container}>
        <Text>No more users to show</Text>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
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
