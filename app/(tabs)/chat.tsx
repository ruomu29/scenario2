import { AllChats } from "@/components/allChats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

function ChatsPage() {
  return (
    <View style={styles.container}>
      <AllChats />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    marginVertical: 10,
  },
});

export default ChatsPage;
