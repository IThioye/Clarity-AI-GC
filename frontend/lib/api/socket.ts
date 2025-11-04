

import { GCP_AGENT_WS_URL } from '@/lib/config';
import { useJournalStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';

const formatTimestamp = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

let socket: WebSocket | null = null;
let isConnected = false;
const pendingMessages: any[] = [];

// We get the chat update function from the Zustand store
const {
  setChat,
  enqueueAssistant,
  dequeueAssistant,
  peekAssistant,
  replaceAssistantHead,
  removeAssistant,
} = useJournalStore.getState();

const connectSocket = (userId: string) => {
  if (socket) {
    if (isConnected) {
      console.log('WebSocket already connected.');
      return;
    }
    if (socket.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket connection is in progress.');
      return;
    }
  }

  if (typeof WebSocket === 'undefined') {
    console.error('WebSocket is not supported in this environment.');
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
    while (pendingMessages.length > 0) {
      const queued = pendingMessages.shift();
      try {
        socket?.send(JSON.stringify(queued));
      } catch (error) {
        console.error('Failed to flush queued message', error);
      }
    }
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    // This is where we handle the 3 message types from our server
    switch (message.type) {
      case 'ACK': {
        // Confirmation that a "NONE" route was processed
        console.log('Server ACK:', message.status);
        const ackText = message.text || 'I’ve logged that entry for you.';
        const queuedAssistantId = peekAssistant();
        let matched = false;

        useJournalStore.setState((state) => {
          if (queuedAssistantId) {
            const updated = state.chat.map((msg) => {
              if (msg.id === queuedAssistantId) {
                matched = true;
                return {
                  ...msg,
                  text: ackText,
                  time: formatTimestamp(),
                };
              }
              return msg;
            });

            if (matched) {
              return { chat: updated };
            }
          }

          matched = true;
          return {
            chat: [
              ...state.chat,
              {
                id: crypto.randomUUID(),
                role: 'assistant' as const,
                text: ackText,
                time: formatTimestamp(),
              },
            ],
          };
        });

        if (matched && queuedAssistantId) {
          dequeueAssistant();
        }

        break;
      }

      case 'TOKEN':
        // This is the "live typing" stream.
        // We append the new token to the last message in the chat.
        (() => {
          const payload =
            typeof message.payload === 'string'
              ? message.payload
              : String(message.payload ?? '');
          if (!payload) {
            return;
          }

          const queuedAssistantId = peekAssistant();
          let matched = false;
          let replacementId: string | null = null;

          useJournalStore.setState((state) => {
            if (queuedAssistantId) {
              const updated = state.chat.map((msg) => {
                if (msg.id === queuedAssistantId) {
                  matched = true;
                  return {
                    ...msg,
                    text: `${msg.text ?? ''}${payload}`,
                    time: msg.text ? msg.time : msg.time || formatTimestamp(),
                  };
                }
                return msg;
              });

              if (matched) {
                return { chat: updated };
              }
            }

            const id = crypto.randomUUID();
            replacementId = id;
            return {
              chat: [
                ...state.chat,
                {
                  id,
                  role: 'assistant' as const,
                  text: payload,
                  time: formatTimestamp(),
                },
              ],
            };
          });

          if (replacementId) {
            if (!queuedAssistantId) {
              enqueueAssistant(replacementId);
            } else if (!matched) {
              replaceAssistantHead(replacementId);
            }
          }
        })();
        break;

      case 'AUDIO':
        // The chat is finished, and we received the audio.
        // The frontend can now play this base64 audio.
        console.log('Received audio data.');
        try {
          const audio = new Audio('data:audio/mp3;base64,' + message.payload);
          void audio.play();
        } catch (error) {
          console.error('Failed to play audio response:', error);
        }
        dequeueAssistant();
        break;
    }
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected.');
    isConnected = false;
    socket = null;
    pendingMessages.length = 0;
    // We could add auto-reconnect logic here
  };

  socket.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };
};

const sendOverSocket = (message: any) => {
  if (socket && isConnected) {
    socket.send(JSON.stringify(message));
    return true;
  }

  if (socket) {
    pendingMessages.push(message);
    return true;
  }

  console.error('WebSocket not connected. Cannot send message.');
  return false;
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
    time: formatTimestamp(),
  };

  // 3. Create the empty "assistant" bubble for the tokens to stream into
  const assistantMessage = {
    id: crypto.randomUUID(),
    role: 'assistant' as const,
    text: '', // Start with an empty text
    time: formatTimestamp(),
  };

  // Update the store
  const currentChat = useJournalStore.getState().chat;
  setChat([...currentChat, userMessage, assistantMessage]);
  enqueueAssistant(assistantMessage.id);

  // 4. Send the user's text to the backend
  const sent = sendOverSocket({
    type: 'NEW_ENTRY',
    payload: {
      raw_text: text,
    },
  });

  if (!sent) {
    useJournalStore.setState((state) => ({
      chat: state.chat.map((msg) =>
        msg.id === assistantMessage.id
          ? {
              ...msg,
              text:
                'I could not reach our thinking space just now. Please check your connection and try again.',
              time: formatTimestamp(),
            }
          : msg
      ),
    }));
    removeAssistant(assistantMessage.id);
  }
};
