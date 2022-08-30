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
}

interface Team {
	id: number
	name: string
	createdAt: any
	updatedAt: any
	DepartmentId: number
}

interface StaffFile {
	id: number
	name: string
	personalEmail: string
	companyEmail: string
	createdAt: any
	updatedAt: any
	TeamId: number
	DepartmentId: number
	PositionId: number
}

interface StaffFileArray extends Array<StaffFile> {}

export { Position, Department, Team, StaffFile }
