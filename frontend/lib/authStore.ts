// Create this file at frontend/lib/authStore.ts
import { create } from 'zustand';
import { azureApi } from '@/lib/api/client'; // We'll use the API client we designed

type AuthState = {
  userId: string | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // This is the function you call from your Login page
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // You might also want a function to load from a saved session
  // (We'll skip this for simplicity)
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  token: null,
  isLoading: false,
  error: null,
  
  logout: () => {
    // TODO: Also call the Azure /api/sessions DELETE endpoint
    set({ userId: null, token: null });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Call your teammate's Azure "sessions" or "login" endpoint
      // This is just an example, you must use his real endpoint
      const response = await azureApi.post('/sessions/login', { email, password });

      if (response && response.session_token && response.user_id) {
        // 2. Save the user ID and token in the store
        set({
          userId: response.user_id,
          token: response.session_token,
          isLoading: false,
        });
        
        // 3. TODO: Save the token to localStorage/cookies to stay logged in
        return true; // Login was successful
      } else {
        throw new Error(response.detail || "Invalid login response");
      }

    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      return false; // Login failed
    }
  },
}));

// --- THIS IS HOW YOU SOLVE THE TODO ---
// Now, any other file (like socket.ts) can get the ID like this:
//
// import { useAuthStore } from '@/lib/authStore';
// const userId = useAuthStore.getState().userId;
//
// You'll pass this `userId` to your `connectSocket(userId)` function.