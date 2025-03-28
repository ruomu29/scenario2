import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

const pinkColor = 'rgb(227,154,150)';


function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: pinkColor,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: { backgroundColor: 'rgb(252, 243, 244)' },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Swipe',
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={pinkColor} />,
          headerStyle: { backgroundColor: 'rgb(252, 190, 190)' },
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat List',
          tabBarIcon: ({ color }) => <TabBarIcon name="comment" color={pinkColor} />,
          headerStyle: { backgroundColor: 'rgb(252, 190, 190)' },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={pinkColor} />,
          headerStyle: { backgroundColor: 'rgb(252, 190, 190)' },
        }}
      />
    </Tabs>
  );
}
