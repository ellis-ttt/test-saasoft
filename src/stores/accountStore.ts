import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Account } from '../types/account'

export const useAccountStore = defineStore('accounts', () => {
	const accounts = ref<Account[]>([])

	const loadAccounts = () => {
		const stored = localStorage.getItem('accounts')
		if (stored) {
			accounts.value = JSON.parse(stored)
		}
	}

	const saveAccounts = () => {
		localStorage.setItem('accounts', JSON.stringify(accounts.value))
	}

	const addAccount = (account: Account) => {
		accounts.value.push(account)
		saveAccounts()
	}

	const updateAccount = (id: string, account: Account) => {
		const index = accounts.value.findIndex((acc) => acc.id === id)
		if (index !== -1) {
			accounts.value[index] = account
			saveAccounts()
		}
	}

	const deleteAccount = (id: string) => {
		accounts.value = accounts.value.filter((acc) => acc.id !== id)
		saveAccounts()
	}

	return {
		accounts,
		loadAccounts,
		addAccount,
		updateAccount,
		deleteAccount,
	}
})
