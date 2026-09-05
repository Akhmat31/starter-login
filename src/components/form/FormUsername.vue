<script setup lang="ts">
import { computed } from "vue";
import type { Props } from "../../api/types/api";
import named from "../../api/name-request";

defineOptions({
    name: "FormUsername"
});
const props = withDefaults(defineProps<Props>(), {
    modelValue: "",
    error: null,
    placeholder: "Username",
    disabled: false,
    required: false,
    name: named.us_,
    id: "usr-name",
    autocomplete: "username"
});

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
    (e: "validate", value: string): void;
}>();

const inputValue = computed({
    get: () => props.modelValue,
    set: (value: string) => {
        emit("update:modelValue", value);
        emit("validate", value);
    }
});
</script>
<template>
    <div class="set-user-username w-full mb-5">
        <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a8.25 8.25 0 0 1 15 0" />
                </svg>
            </div>
            <input v-model="inputValue" type="text" :name="name" :id="id" :placeholder="placeholder" :disabled="disabled" :required="required" :autocomplete="autocomplete" :aria-invalid="!!error" :aria-describedby="error ? `${id}-error` : undefined" 
            :class="['block w-full rounded-lg border bg-white',
                    'py-2.5 pl-10 pr-3',
                    'text-sm text-gray-900',
                    'placeholder-gray-400',
                    'outline-none transition-all duration-200',

                    error ? ['border-red-500',
                            'focus:border-red-500',
                            'focus:ring-2 focus:ring-red-500/20',
                        ] : ['border-gray-300',
                            'hover:border-gray-400',
                            'focus:border-blue-500',
                            'focus:ring-2 focus:ring-blue-500/20',
                        ],
                    disabled ? [ 'cursor-not-allowed',
                            'bg-gray-100',
                            'text-gray-500',
                            'opacity-70',
                        ]: ''
            ]" />
        </div>
        <p v-if="error" :id="`${id}-error`" class="mt-1.5 flex items-center gap-1 text-sm text-red-500" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0V6Zm-1 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
            </svg>
            {{ error }}
        </p>
    </div>
</template>