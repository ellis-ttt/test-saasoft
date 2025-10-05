<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
	modelValue: string
	label: string
	type?: string
	maxlength?: number
	minlength?: number
	invalid?: boolean
	errorText?: string
	inputAttrs?: Record<string, any>
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
	(e: 'blur'): void
	(e: 'input'): void
}>()

const inputType = computed(() => props.type || 'text')

function onInput(event: Event) {
	const target = event.target as HTMLInputElement
	emit('update:modelValue', target.value)
	emit('input')
}
</script>

<template>
	<div>
		<label class="form-label">{{ label }}</label>
		<input
			:class="['form-control', { 'is-invalid': invalid }]"
			:maxlength="maxlength"
			:minlength="minlength"
			:type="inputType"
			:value="modelValue"
			v-bind="inputAttrs"
			@blur="emit('blur')"
			@input="onInput"
		/>
		<div v-if="invalid && errorText" class="invalid-feedback">{{ errorText }}</div>
	</div>
</template>
