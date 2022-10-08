interface Position {
	id: number
	title: string
	createdAt: any
	updatedAt: any
	DepartmentId: number
}

interface Department {
	id: number
	name: string
	createdAt: any
	updatedAt: any
	SupervisorId: number
}

interface Team {
	id: number
	name: string
	createdAt: any
	updatedAt: any
	DepartmentId: number
	SupervisorId: number
}

interface StaffFile {
	id: number
	name: string
	personalEmail: string
	companyEmail: string
	photoLink: string
	phone: number
	legalSex: string
	genderIdentity: string
	ethnicity: string
	appStatus: string
	strikes: number
	censures: number
	pips: number
	activityStatus: string
	alumni: boolean
	createdAt: any
	updatedAt: any
	TeamId: number
	DepartmentId: number
	PositionId: number
	outOfOffice: number
}

interface MessageRecord {
	id: number,
	authoruser: string,
	authorid: string,
	messageId: string,
	messageChannelId: string,
	messageServerId: string,
	time: string,
	createdAt: string
}

interface PositionTableRecord {
	PositionId: number,
	StaffFileId: number
}

interface DepartmentTableRecord {
	DepartmentId: number,
	StaffFileId: number
}

interface TeamTableRecord {
	TeamId: number,
	StaffFileId: number
}

interface Supervisor {
	id: number
	title: string
	StaffFileId: number
}

interface Permit {
	authid: string,
	createdAt: string,
	permit: number
}

interface StaffFileArray extends Array<StaffFile> { }

export { Position, Department, Team, StaffFile, MessageRecord, PositionTableRecord, DepartmentTableRecord, TeamTableRecord, Supervisor, Permit }
