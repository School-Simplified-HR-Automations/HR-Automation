interface Position {
    id: number,
    title: string,
    createdAt: any,
    updatedAt: any,
    DepartmentId: number
}

interface Department {
    id: number,
    name: string,
    createdAt: any,
    updatedAt: any
}

interface Team {
    id: number,
    name: string,
    createdAt: any,
    updatedAt: any,
    DepartmentId: number
}

export { Position, Department, Team }