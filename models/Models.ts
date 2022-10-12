import { DataTypes } from "sequelize"
import { dbSql } from ".."

export default function model() {
    // Models

    const Team = dbSql.define("Team", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    })
    const Supervisor = dbSql.define("Supervisor", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    })
    const StaffFile = dbSql.define("StaffFile", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        personalEmail: {
            type: DataTypes.STRING,
            validate: {
                is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            },
            allowNull: true,
        },
        companyEmail: {
            type: DataTypes.STRING,
            validate: {
                is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            },
            allowNull: true,
        },
        photoLink: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        legalSex: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        genderIdentity: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ethnicity: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        appStatus: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        strikes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        censures: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        pips: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        activityStatus: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        alumni: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        outOfOffice: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        username: {
            type: DataTypes.STRING,
            validate: {
                is: /.{1,}#[0-9]{4}/,
            },
            allowNull: true,
        },
        discordId: {
            type: DataTypes.STRING,
            validate: {
                is: /[0-9]{17,}/,
            },
            allowNull: true,
            unique: true,
        }
    })
    const PositionHistory = dbSql.define("PositionHistory", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dept: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        team: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        joined: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quit: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        terms: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 1
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "No reason provided."
        }
    })
    const Position = dbSql.define("Position", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    })
    const Department = dbSql.define("Department", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    })

    const Messages = dbSql.define("messages", {
        authoruser: {
            type: DataTypes.STRING,
            allowNull: false
        },
        authorid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        messageId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        messageChannelId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        messageServerId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        time: {
            type: DataTypes.DATE,
            allowNull: false
        }
    })

    const APIAuths = dbSql.define("apiauths", {
        authid: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        admin: {
            type: DataTypes.STRING,
            allowNull: false
        },
        backup: {
            type: DataTypes.STRING,
            allowNull: false
        },
        permit: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    })

    const PositionInfo = dbSql.define("positioninfos", {
        StaffFileId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
        },
        PositionId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        TeamId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        DepartmentId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    })

    const Record = dbSql.define("records", {
        StaffFileAdm: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dateExp: {
            type: DataTypes.STRING,
            allowNull: true
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "No reason provided."
        },
        detailLink: {
            type: DataTypes.STRING,
            allowNull: true
        },
        recordType: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    })

    // Association Section

    // Supervisor Associations
    Supervisor.hasMany(Department)
    Department.belongsTo(Supervisor)

    Supervisor.belongsTo(StaffFile)
    StaffFile.hasOne(Supervisor)

    Supervisor.hasMany(Team)
    Team.belongsToMany(Supervisor, { through: "TeamSupervisor" })

    Supervisor.hasMany(Position)
    Position.belongsTo(Supervisor)

    Team.hasMany(Position)
    Position.belongsTo(Team)

    // StaffFile Associations


    StaffFile.hasMany(PositionHistory)
    PositionHistory.belongsTo(StaffFile)

    StaffFile.hasMany(Record)
    Record.belongsTo(StaffFile)

    StaffFile.belongsTo(Team)
    Team.hasMany(StaffFile)

    StaffFile.belongsTo(Department)
    Department.hasMany(StaffFile)

    StaffFile.hasMany(Messages)
    Messages.belongsTo(StaffFile)

    // Team Associations

    Team.belongsTo(Department)
    Department.hasMany(Team)

    // Others

    PositionInfo.hasMany(PositionHistory)
    PositionHistory.belongsTo(PositionInfo)

    Position.belongsTo(Department)
    Department.hasMany(Position)
}