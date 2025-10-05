<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAccountStore } from '../stores/accountStore'
import type { Account, AccountInput } from '../types/account'
import {
	isLabelInvalid,
	isLoginInvalid,
	isPasswordInvalid,
	parseLabels,
} from '../utils/accountUtils'
import FormField from './ui/FormField.vue'
import SelectField from './ui/SelectField.vue'

const props = defineProps<{ account: Account }>()

const accountStore = useAccountStore()

const formData = ref<AccountInput>({
	label: props.account.label.map((l) => l.text).join(';'),
	recordType: props.account.recordType,
	login: props.account.login,
	password: props.account.password || '',
})

const errors = ref({
	label: false,
	login: false,
	password: false,
})

const showPassword = computed(() => formData.value.recordType === 'Local')

const showEditDialog = ref(false)

const openEdit = () => {
	formData.value = {
		label: props.account.label.map((l) => l.text).join(';'),
		recordType: props.account.recordType,
		login: props.account.login,
		password: props.account.password || '',
	}
	errors.value = { label: false, login: false, password: false }
	showEditDialog.value = true
	if (typeof document !== 'undefined') {
		document.body.classList.add('modal-open')
	}
}

const closeEdit = () => {
	showEditDialog.value = false
	if (typeof document !== 'undefined') {
		document.body.classList.remove('modal-open')
	}
}

const validateField = (field: keyof typeof errors.value): boolean => {
	if (field === 'label') {
		errors.value.label = isLabelInvalid(formData.value.label)
		return !errors.value.label
	}
	if (field === 'login') {
		errors.value.login = isLoginInvalid(formData.value.login)
		return !errors.value.login
	}
	if (field === 'password') {
		errors.value.password = isPasswordInvalid(
			formData.value.recordType,
			formData.value.password,
		)
		return !errors.value.password
	}
	return true
}

const validateAll = (): boolean =>
	validateField('label') && validateField('login') && validateField('password')

const saveAccount = () => {
	if (!validateAll()) return
	const updatedAccount: Account = {
		id: props.account.id,
		label: parseLabels(formData.value.label),
		recordType: formData.value.recordType,
		login: formData.value.login,
		password: showPassword.value ? formData.value.password : null,
	}
	accountStore.updateAccount(props.account.id, updatedAccount)
	closeEdit()
}

const handleRecordTypeChange = () => {
	if (formData.value.recordType === 'LDAP') {
		errors.value.password = false
	}
}

const deleteAccount = () => {
	accountStore.deleteAccount(props.account.id)
}
</script>

<template>
	<div class="d-flex align-items-center gap-3 flex-wrap py-2 border rounded px-3">
		<div class="d-flex align-items-center gap-2 flex-wrap flex-grow-1">
			<div class="d-flex align-items-center gap-2" style="min-width: 220px">
				<div v-if="props.account.label.length === 0" class="text-muted">Нет меток</div>
				<div v-else class="d-flex flex-wrap gap-1">
					<span
						v-for="(l, idx) in props.account.label"
						:key="idx"
						class="badge text-bg-secondary"
						>{{ l.text }}</span
					>
				</div>
			</div>

			<div class="text-nowrap" style="min-width: 120px">
				<span
					:class="
						props.account.recordType === 'Local' ? 'text-bg-primary' : 'text-bg-info'
					"
					class="badge"
				>
					{{ props.account.recordType === 'Local' ? 'Локальная' : 'LDAP' }}
				</span>
			</div>

			<div class="flex-grow-1" style="min-width: 200px">
				<span class="form-control-plaintext">{{ props.account.login }}</span>
			</div>

			<div class="flex-grow-1" style="min-width: 200px">
				<span class="form-control-plaintext">
					{{ props.account.recordType === 'Local' ? '••••••••' : 'Н/Д' }}
				</span>
			</div>
		</div>

		<div class="ms-auto d-flex gap-2">
			<button class="btn btn-outline-secondary btn-sm" @click="openEdit">
				Редактировать
			</button>
			<button class="btn btn-outline-danger btn-sm" @click="deleteAccount">Удалить</button>
		</div>

		<teleport v-if="showEditDialog" to="body">
			<div
				aria-labelledby="edit-account-title"
				aria-modal="true"
				class="modal fade show d-block"
				role="dialog"
				tabindex="-1"
			>
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<h5 id="edit-account-title" class="modal-title">
								Редактирование учетной записи
							</h5>
							<button
								aria-label="Закрыть"
								class="btn-close"
								type="button"
								@click="closeEdit"
							></button>
						</div>
						<div class="modal-body">
							<div class="mb-3">
								<FormField
									v-model="formData.label"
									:error-text="'Поле «Метки» должно содержать не более 50 символов.'"
									:input-attrs="{
										title: 'Введите текстовые метки, разделенные точкой с запятой (;)',
									}"
									:invalid="errors.label"
									:maxlength="50"
									label="Метки"
									@blur="validateField('label')"
									@input="validateField('label')"
								/>
							</div>

							<div class="mb-3">
								<SelectField
									v-model="formData.recordType"
									:options="[
										{ value: 'LDAP', text: 'LDAP' },
										{ value: 'Local', text: 'Локальная' },
									]"
									label="Тип записи"
									@change="handleRecordTypeChange"
								/>
							</div>

							<div class="mb-3">
								<FormField
									v-model="formData.login"
									:error-text="'Логин должен содержать от 8 до 100 символов.'"
									:invalid="errors.login"
									:maxlength="100"
									:minlength="8"
									label="Логин"
									@blur="validateField('login')"
									@input="validateField('login')"
								/>
							</div>

							<div v-if="showPassword" class="mb-3">
								<FormField
									v-model="formData.password"
									:error-text="'Пароль должен содержать от 8 до 100 символов.'"
									:invalid="errors.password"
									:maxlength="100"
									:minlength="8"
									label="Пароль"
									type="password"
									@blur="validateField('password')"
									@input="validateField('password')"
								/>
							</div>
						</div>
						<div class="modal-footer">
							<button class="btn btn-outline-secondary btn-sm" @click="closeEdit">
								Отмена
							</button>
							<button class="btn btn-primary btn-sm" @click="saveAccount">
								Сохранить
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-backdrop fade show" @click="closeEdit"></div>
		</teleport>
	</div>
</template>
