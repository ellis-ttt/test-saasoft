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

function onChange(event: Event) {
	const target = event.target as HTMLSelectElement
	emit('update:modelValue', target.value)
	emit('change')
}
</script>

<template>
	<div>
		<label class="form-label">{{ label }}</label>
		<select
			:value="modelValue"
			class="form-select"
			@change="onChange"
		>
			<option v-for="opt in options" :key="opt.value" :value="opt.value">
				{{ opt.text }}
			</option>
		</select>
	</div>
</template>
