import type { Label, RecordType } from '../types/account'

export const parseLabels = (labelString: string): Label[] => {
	if (!labelString.trim()) return []
	return labelString
		.split(';')
		.map((t) => t.trim())
		.filter((t) => t.length > 0)
		.map((text) => ({ text }))
}

export const isLabelInvalid = (label: string) => label.length > 50

export const isLoginInvalid = (login: string) => {
	const len = login.trim().length
	return len === 0 || len < 8 || len > 100
}

export const isPasswordInvalid = (recordType: RecordType, password: string) => {
	if (recordType !== 'Local') return false
	const len = password.trim().length
	return len === 0 || len < 8 || len > 100
}
