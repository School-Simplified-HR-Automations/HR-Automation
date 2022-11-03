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

    class Responses {
        static readonly NOTFOUND = new Responses(404, 'File not found.')
        static readonly STAFF404 = new Responses(404, "Staff member not found.")
        static readonly EMPTY = new Responses(501, "Route not implemented.")

        private constructor(private readonly status: number, public readonly message: any) {}

        toString() {
            return this.status
        }
    }

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

    app.get('/users/', async (req: any, res: any) => {
        res.header("Access-Control-Allow-Origin", "*");
        let id = req.query.id
        if (id) res.send(await Query.staff.getStaffById(parseInt(id)) ?? Responses.NOTFOUND)
        let fn = req.query.first
        let ln = req.query.last
        if (fn && ln) {
            res.send(await Query.staff.getStaffByFullName(fn, ln) ?? Responses.STAFF404)
        }
        else if (fn) {
            const arr = await Query.staff.getStaffByFirstName(fn)
            arr.length > 0 ? res.send(arr) : res.send(Responses.STAFF404)
        }
        else if (ln) {
            const arr = await Query.staff.getStaffByLastName(ln)
            arr.length > 0 ? res.send(arr) : res.send(Responses.STAFF404)
        }
        else {
            res.send(Responses.EMPTY)
        }
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