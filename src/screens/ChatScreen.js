import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { colors, radius } from '../theme';
import { BackBtn } from '../components';
import { db, auth } from '../config/firebase';
import { ref, push, onValue, off, set, serverTimestamp } from 'firebase/database';

const QUICK_REPLIES = [
  'On my way 🚛', 'Reached pickup point', 'Loading in progress',
  'Departed ✅', 'Delay due to traffic', 'Delivered successfully 📦',
];

export default function ChatScreen({ navigation, route }) {
  const { driverName = 'Rajesh Kumar', shipment = 'Mumbai → Delhi', chatId = 'default' } = route?.params || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();
  const uid = auth.currentUser?.uid;

  // Generate a consistent chat room ID
  const roomId = chatId || `chat_${uid}`;

  useEffect(() => {
    // Listen to messages in real time from Firebase
    const messagesRef = ref(db, `chats/${roomId}/messages`);
    onValue(messagesRef, snap => {
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.values(data).sort((a, b) => a.createdAt - b.createdAt);
        setMessages(list);
      } else {
        // Automatically inject a friendly driver greeting on first view
        const initRef = push(ref(db, `chats/${roomId}/messages`));
        set(initRef, {
          id: initRef.key,
          from: 'driver_uid',
          senderName: driverName,
          senderType: 'driver',
          text: `Hello! Rajesh here. I am preparing the truck for ${shipment.split('➔')[0] || 'transit'}. Let me know if you have any specific loading instruction!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now() - 5000,
        });
      }
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    });

    // Listen to typing indicator
    const typingRef = ref(db, `chats/${roomId}/typing`);
    onValue(typingRef, snap => {
      if (snap.exists()) {
        const typingData = snap.val();
        const othersTyping = Object.entries(typingData)
          .some(([key, val]) => key !== uid && val === true);
        setIsTyping(othersTyping);
      }
    });

    return () => {
      off(messagesRef);
      off(typingRef);
    };
  }, [roomId]);

  // Contextual simulated responder for driver replies
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.senderType === 'company') {
      const typingTimer = setTimeout(() => {
        setIsTyping(true);

        const lowerText = (lastMsg.text || '').toLowerCase();
        let replyText = `Understood. Proceeding with the shipping dispatch guidelines!`;

        if (lowerText.includes('where') || lowerText.includes('status') || lowerText.includes('location') || lowerText.includes('reach')) {
          replyText = `Currently tracking on the highway, around 40 km from the next city hub. All telemetry looks clear.`;
        } else if (lowerText.includes('delay') || lowerText.includes('traffic') || lowerText.includes('late')) {
          replyText = `Ran into a minor scan at the checkpost. Moving again in 10 minutes.`;
        } else if (lowerText.includes('safe') || lowerText.includes('care') || lowerText.includes('damage') || lowerText.includes('secure')) {
          replyText = `Rest assured, cargo is tightly strapped and fully waterproof-sealed.`;
        } else if (lowerText.includes('weather') || lowerText.includes('rain')) {
          replyText = `Weather is clear, road visibility is good. No issues here.`;
        }

        const replyTimer = setTimeout(async () => {
          const newRef = push(ref(db, `chats/${roomId}/messages`));
          await set(newRef, {
            id: newRef.key,
            from: 'driver_uid',
            senderName: driverName,
            senderType: 'driver',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: Date.now(),
          });
          setIsTyping(false);
        }, 1800);

        return () => clearTimeout(replyTimer);
      }, 1200);

      return () => clearTimeout(typingTimer);
    }
  }, [messages, roomId, driverName]);

  // Update typing indicator
  const handleTyping = (text) => {
    setInput(text);
    if (uid) {
      set(ref(db, `chats/${roomId}/typing/${uid}`), text.length > 0);
    }
  };

  const send = async (text = input) => {
    if (!text.trim()) return;
    const msgText = text.trim();
    setInput('');

    // Clear typing indicator
    if (uid) {
      set(ref(db, `chats/${roomId}/typing/${uid}`), false);
    }

    // Push message to Firebase
    const newRef = push(ref(db, `chats/${roomId}/messages`));
    await set(newRef, {
      id: newRef.key,
      from: uid,
      senderName: auth.currentUser?.displayName || 'Company',
      senderType: 'company',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
    });

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  };

  const isMe = (msg) => msg.from === uid || msg.senderType === 'company';

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
        <View style={s.headerInfo}>
          <View style={s.avatar}><Text style={{ fontSize: 18 }}>🧑</Text></View>
          <View>
            <Text style={s.headerName}>{driverName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={s.onlineDot} />
              <Text style={s.headerSub}>{shipment}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={s.callBtn}><Text style={{ fontSize: 18 }}>📞</Text></TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={s.messages}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.dateLabel}>
            <Text style={s.dateLabelText}>Today · {shipment}</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
          ) : messages.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
              <Text style={{ fontSize: 14, color: colors.sub, textAlign: 'center' }}>
                No messages yet.{'\n'}Start the conversation!
              </Text>
            </View>
          ) : (
            messages.map(msg => {
              const mine = isMe(msg);
              return (
                <View key={msg.id} style={[s.msgRow, mine && s.msgRowMe]}>
                  {!mine && <View style={s.msgAvatar}><Text>🧑</Text></View>}
                  <View style={[s.bubble, mine ? s.bubbleMe : s.bubbleThem]}>
                    {!mine && (
                      <Text style={{ fontSize: 10, color: colors.accent, fontWeight: '700', marginBottom: 4 }}>
                        {msg.senderName || driverName}
                      </Text>
                    )}
                    <Text style={[s.bubbleText, mine && s.bubbleTextMe]}>{msg.text}</Text>
                    <Text style={[s.msgTime, mine && s.msgTimeMe]}>{msg.time}</Text>
                  </View>
                </View>
              );
            })
          )}

          {/* Typing indicator */}
          {isTyping && (
            <View style={s.msgRow}>
              <View style={s.msgAvatar}><Text>🧑</Text></View>
              <View style={[s.bubble, s.bubbleThem, { paddingVertical: 12 }]}>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <View key={i} style={[s.typingDot, { opacity: 0.4 + i * 0.2 }]} />
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Replies */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.quickRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {QUICK_REPLIES.map(r => (
            <TouchableOpacity key={r} onPress={() => send(r)} style={s.quickChip}>
              <Text style={s.quickChipText}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={s.inputRow}>
          <TouchableOpacity style={s.attachBtn}><Text style={{ fontSize: 20 }}>📎</Text></TouchableOpacity>
          <TextInput
            style={s.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            value={input}
            onChangeText={handleTyping}
            multiline
            maxLength={500}
          />
          <TouchableOpacity onPress={() => send()} style={[s.sendBtn, input.trim() && s.sendBtnActive]}>
            <Text style={{ fontSize: 18 }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.greenS, alignItems: 'center', justifyContent: 'center' },
  headerName: { fontSize: 15, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: 11, color: colors.sub },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green },
  callBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  messages: { flex: 1, backgroundColor: colors.bg },
  dateLabel: { alignItems: 'center', marginBottom: 16 },
  dateLabelText: { fontSize: 11, color: colors.muted, backgroundColor: colors.surface2, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  msgRowMe: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '75%', borderRadius: 16, padding: 12 },
  bubbleMe: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: colors.surface2, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  bubbleTextMe: { color: colors.bg },
  msgTime: { fontSize: 10, color: colors.sub, marginTop: 4 },
  msgTimeMe: { color: 'rgba(0,0,0,0.5)', textAlign: 'right' },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.sub },
  quickRow: { maxHeight: 44, marginBottom: 8 },
  quickChip: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingVertical: 7, paddingHorizontal: 14, height: 34 },
  quickChipText: { fontSize: 12, color: colors.sub },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  attachBtn: { paddingBottom: 8 },
  input: { flex: 1, backgroundColor: colors.surface2, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: colors.text, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
  sendBtnActive: { backgroundColor: colors.accent },
});