

import { GCP_AGENT_WS_URL } from '@/lib/config';
import { useJournalStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';

let socket: WebSocket | null = null;
let isConnected = false;

// We get the chat update function from the Zustand store
const { setChat } = useJournalStore.getState();

const connectSocket = (userId: string) => {
  if (socket && isConnected) {
    console.log('WebSocket already connected.');
    return;
  }

  if (!GCP_AGENT_WS_URL) {
    console.error('GCP_AGENT_WS_URL is not set. Cannot connect WebSocket.');
    return;
  }

  const url = `${GCP_AGENT_WS_URL}/ws/${userId}`;
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('WebSocket connected to Agent Service.');
    isConnected = true;
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    // This is where we handle the 3 message types from our server
    switch (message.type) {
      case 'ACK':
        // Confirmation that a "NONE" route was processed
        console.log('Server ACK:', message.status);
        break;

      case 'TOKEN':
        // This is the "live typing" stream.
        // We append the new token to the last message in the chat.
        setChat(
          useJournalStore.getState().chat.map((msg, index, arr) => {
            if (index === arr.length - 1) {
              return { ...msg, text: msg.text + message.payload };
            }
            return msg;
          })
        );
        break;

      case 'AUDIO':
        // The chat is finished, and we received the audio.
        // The frontend can now play this base64 audio.
        console.log('Received audio data.');
        const audio = new Audio('data:audio/mp3;base64,' + message.payload);
        audio.play();
        break;
    }
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected.');
    isConnected = false;
    socket = null;
    // We could add auto-reconnect logic here
  };

  socket.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };
};

const sendOverSocket = (message: any) => {
  if (socket && isConnected) {
    socket.send(JSON.stringify(message));
  } else {
    console.error('WebSocket not connected. Cannot send message.');
  }
};

export const sendChatMessage = (text: string) => {
  // 1. Ensure we are connected (pass a real user ID)
  // The frontend needs to get this ID after login
  const userId = useAuthStore.getState().userId || '1';
  if (!socket || !isConnected) {
    connectSocket(userId);
  }

  // 2. Add the user's message to the UI immediately
  const userMessage = {
    id: crypto.randomUUID(),
    role: 'user' as const,
    text,
    time: new Date().toISOString(),
  };
  
  // 3. Create the empty "assistant" bubble for the tokens to stream into
  const assistantMessage = {
    id: crypto.randomUUID(),
    role: 'assistant' as const,
    text: '', // Start with an empty text
    time: new Date().toISOString(),
  };

  // Update the store
  const currentChat = useJournalStore.getState().chat;
  setChat([...currentChat, userMessage, assistantMessage]);

  // 4. Send the user's text to the backend
  sendOverSocket({
    type: 'NEW_ENTRY',
    payload: {
      raw_text: text,
    },
  });
};