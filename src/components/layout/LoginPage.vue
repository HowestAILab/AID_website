<template>
  <div class="text-center h-screen flex flex-col items-center justify-center">
    <img
      src="@/assets/reflexion-logo.svg"
      alt="Reflexion Logo"
      class="w-16 h-16 mb-4"
    />
    <h1 class="text-2xl font-bold mb-4">Reflexion</h1>
    <form @submit.prevent="handleLogin" class="w-full max-w-md">
      <Input 
        v-model="email"
        type="email" 
        placeholder="Email" 
        class="w-full mb-2"
        required
      />
      <Input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full mb-4"
        required
      />
      <Button 
        type="submit"
        :disabled="isLoading"
        class="w-full bg-[#F5F0E5] text-[#1C170D] hover:bg-[#DBD1BA] cursor-pointer mb-4"
      >
        Login
      </Button>
    </form>
    <p class="text-sm text-gray-500">
      Don't have an account? <a href="#" class="text-[#F59E0C]">Sign up</a>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/composables/useAuth";

const { login } = useAuth();

const email = ref('');
const password = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    return;
  }
  
  try {
    isLoading.value = true;
    await login(email.value, password.value);
    // Navigation will be handled by App.vue watching auth state
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    isLoading.value = false;
  }
};
</script> 