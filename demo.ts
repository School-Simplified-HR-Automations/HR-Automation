class DepartmentQueryRoutes {
    getDepartment(filter: {
        id?: number,
        SupervisorId?: number,
        name?: string
    }) {
        let idquery: string | null
        let supervisorquery: string | null
        let namequery: string | null
        let filters: string[] = []
        if (filter.id) {
            idquery = `id = ${filter.id}`
            filters.push(idquery)
        } else idquery = null
        if (filter.SupervisorId) {
            supervisorquery = `SupervisorId = ${filter.SupervisorId}`
            filters.push(supervisorquery)
        } else supervisorquery = null
        if (filter.name) {
            namequery = `name = '${filter.name}'`
            filters.push(namequery)
        } else namequery = null
        let querystr = `SELECT * FROM positions`
        console.log(filters)
        for (let i = 0; i < filters.length; i++) {
            if (i == 0) {
                querystr += ` WHERE ${filters[i]}`
                continue
            }
            querystr += ` AND ${filters[i]}`
        }
        console.log(querystr)
    }
}

new DepartmentQueryRoutes().getDepartment({ id: 1 })