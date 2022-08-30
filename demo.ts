import Query from "./routes/query";

const func = async () => {
    const query = new Query();
    const dept = (await query.departments.getDepartment(
        { id: 
            (await query.staff.getDepartmentByStaffDepartment(
                (await query.staff.getStaffByFullName("Tyler", "McDonald"))
                )).id 
            })).name
    console.log(dept)
}

func()