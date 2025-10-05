<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import AccountItem from './AccountItem.vue'
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
import EmptyState from './ui/EmptyState.vue'

const accountStore = useAccountStore()

const showDialog = ref(false)
const form = ref<AccountInput>({
	label: '',
	recordType: 'Local',
	login: '',
	password: '',
})

const errors = ref({
	label: false,
	login: false,
	password: false,
})

const showPassword = computed(() => form.value.recordType === 'Local')

const resetForm = () => {
	form.value = { label: '', recordType: 'Local', login: '', password: '' }
	errors.value = { label: false, login: false, password: false }
}

const openDialog = () => {
	resetForm()
	showDialog.value = true
	if (typeof document !== 'undefined') {
		document.body.classList.add('modal-open')
	}
}

const closeDialog = () => {
	showDialog.value = false
	if (typeof document !== 'undefined') {
		document.body.classList.remove('modal-open')
	}
}

const validateField = (field: keyof typeof errors.value): boolean => {
	if (field === 'label') {
		errors.value.label = isLabelInvalid(form.value.label)
		return !errors.value.label
	}
	if (field === 'login') {
		errors.value.login = isLoginInvalid(form.value.login)
		return !errors.value.login
	}
	if (field === 'password') {
		errors.value.password = isPasswordInvalid(form.value.recordType, form.value.password)
		return !errors.value.password
	}
	return true
}

const validateAll = () =>
	validateField('label') && validateField('login') && validateField('password')

const handleRecordTypeChange = () => {
	if (form.value.recordType === 'LDAP') {
		errors.value.password = false
	}
}

const createAccount = () => {
	if (!validateAll()) return
	const newAccount: Account = {
		id: crypto.randomUUID(),
		label: parseLabels(form.value.label),
		recordType: form.value.recordType,
		login: form.value.login,
		password: showPassword.value ? form.value.password : null,
	}
	accountStore.addAccount(newAccount)
	closeDialog()
}

onMounted(() => {
	accountStore.loadAccounts()
})
</script>

<template>
	<div class="container py-4">
		<div class="d-flex align-items-center justify-content-between mb-3 accounts-header">
			<h1 class="h3 mb-0">Учетные записи</h1>
			<button
				class="btn btn-primary btn-sm"
				title="Добавить учетную запись"
				@click="openDialog"
			>
				<span aria-hidden="true">+</span>
				<span class="visually-hidden">Добавить</span>
			</button>
		</div>

		<template v-if="accountStore.accounts.length > 0">
			<div class="d-flex align-items-center gap-3 flex-wrap py-2 px-3 text-muted small">
				<div class="d-flex align-items-center gap-2" style="min-width: 220px">Метки</div>
				<div class="text-nowrap" style="min-width: 120px">Тип</div>
				<div class="flex-grow-1" style="min-width: 200px">Логин</div>
				<div class="flex-grow-1" style="min-width: 200px">Пароль</div>
			</div>

			<div class="vstack gap-3 accounts-list">
				<AccountItem
					v-for="account in accountStore.accounts"
					:key="account.id"
					:account="account"
				/>
			</div>
		</template>
		<div v-else class="vstack gap-3 accounts-list">
			<EmptyState text="Нет учетных записей" />
		</div>

		<teleport v-if="showDialog" to="body">
			<div
				aria-labelledby="new-account-title"
				aria-modal="true"
				class="modal fade show d-block"
				role="dialog"
				tabindex="-1"
			>
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<h5 id="new-account-title" class="modal-title">
								Создание учетной записи
							</h5>
							<button
								aria-label="Закрыть"
								class="btn-close"
								type="button"
								@click="closeDialog"
							></button>
						</div>
						<div class="modal-body">
							<div class="mb-3">
								<FormField
									v-model="form.label"
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
									v-model="form.recordType"
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
									v-model="form.login"
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
									v-model="form.password"
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
							<button class="btn btn-outline-secondary btn-sm" @click="closeDialog">
								Отмена
							</button>
							<button class="btn btn-primary btn-sm" @click="createAccount">
								Создать
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-backdrop fade show" @click="closeDialog"></div>
		</teleport>
	</div>
</template>
