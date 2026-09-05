import { ref } from "vue";

const username = ref("");
const password = ref("");
const usernameError = ref<string | null>(null);
const passwordError = ref<string | null>(null);

let validatePassword = (value: string) => {
    if (!value) {
        passwordError.value = "Password wajib diisi.";
        return false;
    }
    if (value.length < 8) {
        passwordError.value = "Password minimal 8 karakter.";
        return false;
    }
    passwordError.value = null;
    return true;
};
let validateUsername = (value: string) => {
    if (!value) {
        usernameError.value = "Username wajib diisi.";
        return false;
    }

    if (value.length < 3) {
        usernameError.value = "Username minimal 3 karakter.";
        return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        usernameError.value =
            "Username hanya boleh berisi huruf, angka, dan underscore.";
        return false;
    }

    usernameError.value = null;
    return true;
};
export {username, usernameError, password, passwordError, validatePassword, validateUsername}