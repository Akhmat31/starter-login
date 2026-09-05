<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import FormPassword from "./components/form/FormPassword.vue";
import FormUsername from "./components/form/FormUsername.vue";
import { username, password, usernameError, passwordError, validateUsername, validatePassword } from "./api/form-handler.ts";
import { loginUser } from "./api/api.ts";
import { setToken, CLIENT_ID } from "./api/token.ts";

const router = useRouter();
const isLoading = ref(false);
const serverError = ref<string | null>(null);

async function handleSubmit() {
    const validUsername = validateUsername(username.value);
    const validPassword = validatePassword(password.value);
    if (!validUsername || !validPassword) return;

    isLoading.value = true;
    serverError.value = null;

    try {
        const response = await loginUser({
            username: username.value,
            password: password.value,
            client_id: CLIENT_ID
        });

        if (response.success && response.token) {
            // Simpan token JWT ke localStorage
            setToken(response.token);
            // Redirect ke halaman /home
            router.push("/home");
        } else {
            serverError.value = response.message || "Gagal melakukan login.";
        }
    } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
            serverError.value = err.response.data.error;
        } else if (err.message) {
            serverError.value = err.message;
        } else {
            serverError.value = "Gagal terhubung ke Gateway server.";
        }
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div class="min-h-screen w-full bg-gray-50 px-4 flex items-center justify-center">
        <div class="c-login w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200/50">
            <div class="mb-8 text-center">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a8.25 8.25 0 0 1 15 0" />
                    </svg>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
                <p class="mt-2 text-sm text-gray-500">Silakan masuk untuk melanjutkan ke Aplikasi Toko Online</p>
            </div>

            <!-- Pesan Error dari Server/Gateway -->
            <div v-if="serverError" class="mb-5 rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700 flex items-start gap-2.5" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0V6Zm-1 8a1 1 0 1 0 0-2 1 1 0 0 0 1 2Z" clip-rule="evenodd" />
                </svg>
                <span>{{ serverError }}</span>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-5">
                <FormUsername v-model="username" :error="usernameError" :disabled="isLoading" @validate="validateUsername" />
                <FormPassword v-model="password" :error="passwordError" :disabled="isLoading" placeholder="Masukkan password" @validate="validatePassword" />
                <button type="submit" :disabled="isLoading"
                    class="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                    <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{{ isLoading ? 'Sedang Memproses...' : 'Login' }}</span>
                </button>
            </form>

            <!-- Akun Demo Info -->
            <div class="mt-6 rounded-lg bg-blue-50/70 p-3.5 border border-blue-100 text-xs text-blue-800">
                <p class="font-semibold mb-1">Akun Demo (Mock Data):</p>
                <div class="flex justify-between">
                    <span>Username: <code class="bg-blue-100/70 px-1 py-0.5 rounded font-mono">john_doe</code></span>
                    <span>Password: <code class="bg-blue-100/70 px-1 py-0.5 rounded font-mono">admin#1234</code></span>
                </div>
            </div>

            <div class="mt-4 text-center">
                <p class="text-xs text-gray-400">JWT & Parameter Client ID Protected</p>
            </div>
        </div>
    </div>
</template>