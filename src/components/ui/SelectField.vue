<script lang="ts" setup>
const props = defineProps<{
	modelValue: string
	label: string
	options: { value: string; text: string }[]
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
	(e: 'change'): void
}>()
</script>

<template>
	<div>
		<label class="form-label">{{ label }}</label>
		<select
			:value="modelValue"
			class="form-select"
			@change="
				emit('update:modelValue', ($event.target as HTMLSelectElement).value)
				emit('change')
			"
		>
			<option v-for="opt in options" :key="opt.value" :value="opt.value">
				{{ opt.text }}
			</option>
		</select>
	</div>
</template>
