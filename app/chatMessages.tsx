import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Card, IconButton, Text, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { formatRelativeTime } from '@/components/relativeTime';
import { subscribeToMessages, sendMessage } from '@/services/chatService';

export default function ChatMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { chatId, chatName } = useLocalSearchParams();
  const router = useRouter();

  const renderMessage = ({ item }: { item: any }) => {
    const timeDisplay = formatRelativeTime(item.created_at);
    return (
      <Card style={styles.messageCard}>
        <Card.Content>
          <Text style={styles.messageText}>{item.value}</Text>
          <Text style={styles.timestamp}>{timeDisplay}</Text>
        </Card.Content>
      </Card>
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;
    try {
      await sendMessage(chatId.toString(), newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Send message failed:', error);
    }
  };

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = subscribeToMessages(
      chatId.toString(),
      (data) => setMessages(data),
      (err) => console.error('Subscribe error:', err)
    );

    return () => unsubscribe();
  }, [chatId]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <IconButton icon="chevron-left" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{chatName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
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
  messageCard: {
    maxWidth: '75%',
    marginVertical: 8,
    backgroundColor: 'rgb(252, 204, 208)',
    alignSelf: 'flex-start',
    borderRadius: 16,
    elevation: 1,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  anotherUserMessageCard: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgb(249,229,231)',
  },
  messageText: {
    fontSize: 16,
    color: 'rgb(51, 51, 51)',
    lineHeight: 22,
  },
  anotherUserMessageText: {
    color: 'rgb(249,229,231)',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(51, 51, 51, 0.6)',
    marginTop: 4,
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