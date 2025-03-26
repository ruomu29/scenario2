import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Card, IconButton, Text, Button, Avatar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { formatRelativeTime } from '@/components/relativeTime';
import { subscribeToMessages, sendMessage } from '@/services/chatService';
import { getUserProfile } from '@/services/profileService';
import { getDoc, DocumentReference, doc } from '@firebase/firestore';
import { db } from '@/config/firebaseConfig';

export default function ChatMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesWithUserData, setMessagesWithUserData] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { chatId, chatName } = useLocalSearchParams();
  const router = useRouter();
  const [usersCache, setUsersCache] = useState<{[key: string]: any}>({});

  // Fetch user data from a document reference
  const fetchUserData = async (userRef: DocumentReference) => {
    // Generate a cache key from the reference path
    const cacheKey = userRef.path;
    
    // Check if we already have this user's data in the cache
    if (usersCache[cacheKey]) {
      return usersCache[cacheKey];
    }
    
    try {
      // Get the document from the reference
      const userSnapshot = await getDoc(userRef);
      
      if (userSnapshot.exists()) {
        const userData = {
          id: userSnapshot.id,
          ref: userRef,
          ...userSnapshot.data()
        };
        
        // Update the cache with this user's data
        setUsersCache(prevCache => ({
          ...prevCache,
          [cacheKey]: userData
        }));
        
        return userData;
      } else {
        console.log(`No user found for reference: ${userRef.path}`);
        return null;
      }
    } catch (error) {
      console.error(`Failed to fetch user data for reference ${userRef.path}:`, error);
      return null;
    }
  };

  // Enhance messages with user data
  const enhanceMessagesWithUserData = async (messages: any[]) => {
    try {
      const enhancedMessages = await Promise.all(
        messages.map(async (message) => {
          console.log("message", message)
          const userData = await fetchUserData(message.user_id);
          return {
            ...message,
            userData
          };
        })
      );
      
      setMessagesWithUserData(enhancedMessages);
    } catch (error) {
      console.error('Error enhancing messages with user data:', error);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    // Compare references for determining the current user
    // const messageUser = await fetchUserData(item.user_id)
    const isCurrentUser = currentUser && item.userData.uid === currentUser.uid;
    const userName = item.userData.name || 'Unknown User';
    const userAvatar = item.userData.avatar;
    const timeDisplay = formatRelativeTime(item.created_at);
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessageContainer : styles.otherUserMessageContainer
      ]}>
        {!isCurrentUser && (
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Avatar.Image size={32} source={{ uri: userAvatar }} />
            ) : (
              <Avatar.Text size={32} label={(userName?.substring(0, 2) || 'UN').toUpperCase()} />
            )}
          </View>
        )}
        
        <View style={styles.messageContentContainer}>
          {!isCurrentUser && (
            <Text style={styles.userName}>{userName}</Text>
          )}
          
          <Card 
            style={[
              styles.messageCard,
              isCurrentUser ? styles.currentUserMessageCard : styles.otherUserMessageCard
            ]}
          >
            <Card.Content>
              <Text style={styles.messageText}>{item.value}</Text>
              <Text style={styles.timestamp}>{timeDisplay}</Text>
            </Card.Content>
          </Card>
        </View>
        
        {isCurrentUser && (
          <View style={styles.avatarContainer}>
            {currentUser?.avatar ? (
              <Avatar.Image size={32} source={{ uri: currentUser.avatar }} />
            ) : (
              <Avatar.Text size={32} label={(currentUser?.name?.substring(0, 2) || 'ME').toUpperCase()} />
            )}
          </View>
        )}
      </View>
    );
  };

  const handleSendMessage = async () => {
    
    if (!newMessage.trim() || !chatId) return;
    try {
      console.log('Sending message:', newMessage);
      console.log('Current user:', currentUser);
      const userDoc = doc(db, "users", currentUser.uid);
      const messageToSend = newMessage.trim();

      await sendMessage(chatId.toString(), messageToSend, userDoc);
      setNewMessage('');
    } catch (error) {
      console.error('Send message failed:', error);
    }
  };

  // Fetch authenticated user data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = await getUserProfile();
        console.log('Current user:', user);
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Subscribe to messages and enhance them with user data
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = subscribeToMessages(
      chatId.toString(),
      async (data: any) => {
        setMessages(data);
        await enhanceMessagesWithUserData(data);
      },
      (err: any) => console.error('Subscribe error:', err)
    );

    return () => unsubscribe();
  }, [chatId]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <IconButton icon="chevron-left" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{chatName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={messagesWithUserData}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        inverted={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No messages yet</Text>
            <Text>Start the conversation!</Text>
          </View>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          mode="flat"
          style={styles.input}
          multiline
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          theme={{
            colors: {
              primary: 'rgb(224, 114, 109)',
              placeholder: 'rgb(153, 153, 153)',
              text: 'rgb(51, 51, 51)',
            },
            roundness: 17,
          }}
        />

        <Button
          mode="contained"
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
          style={styles.sendButton}
          contentStyle={{ paddingHorizontal: 12 }}
        >
          Send
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(255, 237, 237)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgb(252, 190, 190)',
    elevation: 2,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgb(51, 51, 51)',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  currentUserMessageContainer: {
    flexDirection: 'row-reverse',
  },
  otherUserMessageContainer: {
    flexDirection: 'row',
  },
  avatarContainer: {
    marginHorizontal: 8,
  },
  messageContentContainer: {
    maxWidth: '70%',
  },
  userName: {
    fontSize: 12,
    color: 'rgb(102, 102, 102)',
    marginBottom: 4,
    fontWeight: '500',
  },
  messageCard: {
    borderRadius: 16,
    elevation: 1,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  currentUserMessageCard: {
    backgroundColor: 'rgb(252, 204, 208)',
    borderBottomRightRadius: 4, // Creates speech bubble effect
  },
  otherUserMessageCard: {
    backgroundColor: 'rgb(249, 229, 231)',
    borderBottomLeftRadius: 4, // Creates speech bubble effect
  },
  messageText: {
    fontSize: 16,
    color: 'rgb(51, 51, 51)',
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(51, 51, 51, 0.6)',
    marginTop: 4,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgb(239, 239, 239)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgb(255,189,194)',
    borderRadius: 17,
    marginRight: 12,
    maxHeight: 120,
  },
  sendButton: {
    borderRadius: 24,
    backgroundColor: 'rgb(249, 201, 199)',
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});