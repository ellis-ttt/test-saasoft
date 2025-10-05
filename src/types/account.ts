export type RecordType = 'LDAP' | 'Local'

export interface Label {
	text: string
}

export interface Account {
	id: string
	label: Label[]
	recordType: RecordType
	login: string
	password: string | null
}

export interface AccountInput {
	label: string
	recordType: RecordType
	login: string
	password: string
}
