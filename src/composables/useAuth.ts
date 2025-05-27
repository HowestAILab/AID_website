import { ref, computed } from 'vue';

const STORAGE_KEY = 'reflexion_auth_state';

const isLoggedIn = ref(false);
const user = ref<{ email: string } | null>(null);

// Initialize from localStorage
const initializeAuth = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const authData = JSON.parse(stored);
      isLoggedIn.value = authData.isLoggedIn || false;
      user.value = authData.user || null;
    }
  } catch (error) {
    console.error('Failed to initialize auth from localStorage:', error);
  }
};

// Save to localStorage
const saveAuthState = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isLoggedIn: isLoggedIn.value,
      user: user.value
    }));
  } catch (error) {
    console.error('Failed to save auth state to localStorage:', error);
  }
};

export function useAuth() {
  const login = (email: string, password: string) => {
    // For now accept anything
    // TODO: Implement actual login logic
    isLoggedIn.value = true;
    user.value = { email };
    saveAuthState();
    return Promise.resolve();
  };

  const logout = () => {
    isLoggedIn.value = false;
    user.value = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove auth state from localStorage:', error);
    }
  };

  const checkAuthStatus = computed(() => isLoggedIn.value);
  const currentUser = computed(() => user.value);

  return {
    isLoggedIn: checkAuthStatus,
    user: currentUser,
    login,
    logout,
    initializeAuth,
  };
} 