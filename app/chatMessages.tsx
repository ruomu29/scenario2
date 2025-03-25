import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { formatRelativeTime } from '@/components/relativeTime';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function ChatMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const {chatId, chatName} = useLocalSearchParams();

  const router = useRouter()

  const renderMessage = ({ item }: { item: any }) => {
    const timeDisplay = formatRelativeTime(item.created_at);
    
    return (
      <View style={styles.messageContainer}>
        <View style={styles.messageContent}>
          <Text style={styles.messageText}>{item.value}</Text>
          <Text style={styles.timestamp}>{timeDisplay}</Text>
        </View>
      </View>
    );
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;
    
    try {
      const messagesRef = collection(db, "chats", chatId.toString(), "messages");
      await addDoc(messagesRef, {
        value: newMessage.trim(),
        created_at: serverTimestamp()
      });
      setNewMessage(''); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (!chatId) return;
    
    const messagesRef = collection(db, "chats", chatId.toString(), "messages");
    const messagesQuery = query(messagesRef, orderBy("created_at", "asc"));
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageData: any[] = [];
      snapshot.forEach((doc) => {
        messageData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setMessages(messageData);
    }, (error) => {
      console.error("Error in messages listener:", error);
    });
    
    return () => unsubscribe();
  }, [chatId]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
    
    <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <FontAwesome name="chevron-left" size={16} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{chatName}</Text>
          <View style={styles.headerRight} /> {/* Empty view for balanced layout */}
        </View>
      
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        }
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <FontAwesome name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 36, // Same width as back button for balanced layout
  },
  list: {
    width: '100%',
    flex: 1,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  messageContainer: {
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  messageContent: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#333333',
  },
  timestamp: {
    fontSize: 12,
    color: '#333333',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    alignItems: 'center',
    borderRadius : 15,
    marginBottom : 20
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#4A6FFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});