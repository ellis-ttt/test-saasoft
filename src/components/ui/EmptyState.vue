<script lang="ts" setup>
const props = defineProps<{ text: string }>()
</script>

<template>
	<div
		class="py-2 border rounded px-3 text-muted d-flex align-items-center justify-content-center"
	>
		{{ props.text }}
	</div>
</template>
