import { app } from "../../index"
import Query from "../../routes/query"

const src = [
	{
		title: "SS HR API",
		author: "SS HR",
		version: "v0.0.1"
	}
]

app.get('/', (req: any, res: any) => {
	res.send(src)
})

app.get('/users/:firstname', async (req: any, res: any) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.send(await new Query().staff.getStaffByFirstName(`${req.params.firstname}`))
})