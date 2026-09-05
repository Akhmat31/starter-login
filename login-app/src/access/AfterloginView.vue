<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
    decodeToken,
    getToken,
    getSecurityToken,
    decodeSecurityToken,
    removeToken,
    removeSecurityToken,
    type JwtPayload,
    type SecurityTokenPayload
} from "../api/token";
import { fetchUserData, fetchSecurityToken } from "../api/api";

defineOptions({
    name: "AfterloginView"
});

const router = useRouter();
const tokenData = ref<JwtPayload | null>(null);
const rawToken = ref<string | null>(null);
const secTokenData = ref<SecurityTokenPayload | null>(null);
const rawSecToken = ref<string | null>(null);
const serverData = ref<any>(null);
const isLoading = ref(true);
const isRefreshingSecToken = ref(false);
const errorMessage = ref<string | null>(null);

function loadTokenStates() {
    rawToken.value = getToken();
    tokenData.value = decodeToken();
    rawSecToken.value = getSecurityToken();
    secTokenData.value = decodeSecurityToken();
}

onMounted(async () => {
    loadTokenStates();

    try {
        const res = await fetchUserData();
        serverData.value = res.data;
    } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
            errorMessage.value = err.response.data.error;
        } else {
            errorMessage.value = "Gagal mengambil data dari Server melalui Gateway.";
        }
    } finally {
        isLoading.value = false;
    }
});

async function handleRefreshToken() {
    isRefreshingSecToken.value = true;
    try {
        await fetchSecurityToken();
        loadTokenStates();
        // Coba fetch ulang data dengan security token baru
        const res = await fetchUserData();
        serverData.value = res.data;
        errorMessage.value = null;
    } catch (err: any) {
        errorMessage.value = "Gagal memperbarui Security Token.";
    } finally {
        isRefreshingSecToken.value = false;
    }
}

function handleLogout() {
    removeToken();
    removeSecurityToken();
    router.push("/");
}
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-200 p-4 md:p-10">
        <div class="max-w-5xl mx-auto space-y-6">
            <!-- Header Bar -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20">
                        {{ tokenData?.display_name?.charAt(0) || 'U' }}
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h1 class="text-xl font-bold text-gray-900">
                                Selamat Datang, {{ tokenData?.display_name || 'User' }}!
                            </h1>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                <span class="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Double Token Defense
                            </span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">
                            Akses Path: <code class="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">http://localhost:3000/home</code>
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-2.5">
                    <button
                        @click="handleRefreshToken"
                        :disabled="isRefreshingSecToken"
                        class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl transition-all disabled:opacity-50">
                        <svg :class="{'animate-spin': isRefreshingSecToken}" class="h-3.5 w-3.5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Security Token
                    </button>
                    <button
                        @click="handleLogout"
                        class="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            <!-- Content Grid: 2 Kolom -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 1. JWT User Auth Token Card -->
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h2 class="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wide">
                            <span class="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
                                </svg>
                            </span>
                            1. JWT Auth Token (User Identity)
                        </h2>
                        <span class="text-[11px] bg-blue-50 text-blue-700 font-mono font-semibold px-2 py-0.5 rounded">Authorization</span>
                    </div>

                    <div class="space-y-2.5 text-xs">
                        <div class="flex justify-between items-center py-1 border-b border-gray-50">
                            <span class="text-gray-500">Parameter Client ID:</span>
                            <span class="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{{ tokenData?.client_id || '-' }}</span>
                        </div>
                        <div class="flex justify-between items-center py-1 border-b border-gray-50">
                            <span class="text-gray-500">Username:</span>
                            <span class="font-medium text-gray-800">{{ tokenData?.username || '-' }}</span>
                        </div>
                        <div class="flex justify-between items-center py-1 border-b border-gray-50">
                            <span class="text-gray-500">Display Name:</span>
                            <span class="font-medium text-gray-800">{{ tokenData?.display_name || '-' }}</span>
                        </div>
                        <div class="flex justify-between items-center py-1">
                            <span class="text-gray-500">Status Autentikasi:</span>
                            <span class="text-emerald-600 font-semibold flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Terverifikasi
                            </span>
                        </div>
                    </div>

                    <div class="pt-2">
                        <p class="text-[11px] text-gray-400 font-medium mb-1">Bearer Token Preview:</p>
                        <div class="bg-gray-900 text-blue-300 font-mono text-[10px] p-2.5 rounded-lg break-all max-h-20 overflow-y-auto select-all leading-tight">
                            {{ rawToken }}
                        </div>
                    </div>
                </div>

                <!-- 2. Security Token Card -->
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h2 class="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wide">
                            <span class="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                            </span>
                            2. Security Token (Anti-CSRF & Integrity)
                        </h2>
                        <span class="text-[11px] bg-amber-50 text-amber-700 font-mono font-semibold px-2 py-0.5 rounded">X-Security-Token</span>
                    </div>

                    <div class="space-y-2.5 text-xs">
                        <div class="flex justify-between items-center py-1 border-b border-gray-50">
                            <span class="text-gray-500">Metode Validasi:</span>
                            <span class="font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">HMAC-SHA256 + Nonce</span>
                        </div>
                        <div class="flex justify-between items-center py-1 border-b border-gray-50">
                            <span class="text-gray-500">Anti-Replay Nonce:</span>
                            <span class="font-mono text-gray-700 truncate max-w-[180px]">{{ secTokenData?.nonce || '-' }}</span>
                        </div>
                        <div class="flex justify-between items-center py-1 border-b border-gray-50">
                            <span class="text-gray-500">Masa Berlaku (TTL):</span>
                            <span class="font-medium text-gray-700">15 Menit (Ephemeral)</span>
                        </div>
                        <div class="flex justify-between items-center py-1">
                            <span class="text-gray-500">Status Keamanan:</span>
                            <span class="text-emerald-600 font-semibold flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Active & Verified
                            </span>
                        </div>
                    </div>

                    <div class="pt-2">
                        <p class="text-[11px] text-gray-400 font-medium mb-1">Security Token Preview:</p>
                        <div class="bg-gray-900 text-amber-300 font-mono text-[10px] p-2.5 rounded-lg break-all max-h-20 overflow-y-auto select-all leading-tight">
                            {{ rawSecToken }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Server Data & Security Layer Summary -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h2 class="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wide">
                        <span class="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                        </span>
                        Respons Data Terproteksi (Server &larr; Gateway &larr; Login-App)
                    </h2>
                    <span class="text-[11px] bg-indigo-50 text-indigo-700 font-mono font-semibold px-2 py-0.5 rounded">200 OK</span>
                </div>

                <div v-if="isLoading" class="py-6 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <svg class="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-xs">Memvalidasi token ganda dan memuat data...</span>
                </div>

                <div v-else-if="errorMessage" class="p-4 bg-red-50 border border-red-200 text-xs text-red-600 rounded-xl">
                    {{ errorMessage }}
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div class="rounded-xl bg-slate-50 p-3.5 border border-slate-200/70">
                        <span class="text-slate-400 font-medium block mb-1">Layer 1: Login App</span>
                        <p class="font-semibold text-slate-800">Menyertakan <code>Bearer JWT</code> + <code>X-Security-Token</code></p>
                    </div>
                    <div class="rounded-xl bg-slate-50 p-3.5 border border-slate-200/70">
                        <span class="text-slate-400 font-medium block mb-1">Layer 2: Gateway</span>
                        <p class="font-semibold text-slate-800">Validasi Origin, HMAC Token, Nonce & JWT Client ID</p>
                    </div>
                    <div class="rounded-xl bg-slate-50 p-3.5 border border-slate-200/70">
                        <span class="text-slate-400 font-medium block mb-1">Layer 3: Server</span>
                        <p class="font-semibold text-slate-800">Menerima request via <code>x-gateway-secret</code></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>