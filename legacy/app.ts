import bodyParser from "body-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import Query from "../routes/query"

export default function apiInit() {
    const app = express()
    app.use(helmet())
    app.use(bodyParser.json())
    app.use(cors({
        origin: "*"
    }))
    app.use(morgan('combined'))
    app.listen(3000, () => {
        console.log("Server started on port 3000")
    })

    // API Test Object

    const src = [
        {
            title: "SS HR API",
            author: "SS HR",
            version: "v0.0.1"
        }
    ]

    // Test API Routes

    app.get('/', (req: any, res: any) => {
        res.send(src)
    })

    app.get('/users/firstname/:firstname', async (req: any, res: any) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.send(await Query.staff.getStaffByFirstName(`${req.params.firstname}`))
    })

    app.get('/users/lastname/:lastname', async (req: any, res: any) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.send(await Query.staff.getStaffByLastName(`${req.params.lastname}`))
    })

    app.get('/users/id', async (req: any, res: any) => {
        let id = parseInt(req.query.id)
        if (isNaN(id)) res.send({
            status: 400,
            message: "Invalid ID"
        })
        res.header("Access-Control-Allow-Origin", "*");
        res.send(await Query.staff.getStaffById(id))

    })

    app.get('/users/email', async (req: any, res: any) => {
        try {
            res.header("Access-Control-Allow-Origin", "*");
            res.send(await Query.staff.getStaffByEmail(`${req.query.email}`, 'Company'))
        } catch {

        }
    })
}