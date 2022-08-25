import { Stopwatch } from "@sapphire/stopwatch";
import { ChatInputCommandInteraction, Embed, EmbedBuilder, InteractionResponse, SlashCommandBuilder } from "discord.js";
import { QueryTypes } from "sequelize";
import { dbSql, Department, StaffFile, Team } from "..";
import { Department as DepartmentType, Position, Team as TeamType } from "../types/common/ReturnTypes";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hire')
        .setDescription("Hires a user via a suite of actions.")
        .addStringOption(opt => opt.setName("firstname").setDescription("The hire's first name").setRequired(true))
        .addStringOption(opt => opt.setName("lastname").setDescription("The hire's last name").setRequired(true))
        .addStringOption(opt => opt.setName("email").setDescription("The hire's email").setRequired(true))
        .addStringOption(opt => opt.setName("position").setDescription("The hire's position").setRequired(true))
        .addStringOption(opt => opt.setName("department").setDescription("The hire's department").setRequired(true))
        .addStringOption(opt => opt.setName("team").setDescription("The hire's team").setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction) {
        const sw = new Stopwatch(2).start()
        let team = interaction.options.getString("team")
        const posres: Position[] = await dbSql.query(`SELECT * FROM positions WHERE title = '${interaction.options.getString("position")}'`, { type: QueryTypes.SELECT })
        if (posres.length < 1) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setTitle("Error During Hire").setDescription("The position you requested does not exist in our system. Please try again, being mindful of capitalization and punctuation if necessary.")]
            })
        }
        const deptres: DepartmentType[] = await dbSql.query(`SELECT * FROM departments WHERE name = '${interaction.options.getString("department")}'`, { type: QueryTypes.SELECT })
        if (deptres.length < 1) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setTitle("Error During Hire").setDescription("The department you requested does not exist in our system. Please try again, being mindful of capitalization and punctuation if necessary.")]
            })
        }
        let teamres: TeamType[] = []
        if (team) {
            teamres = await dbSql.query(`SELECT * FROM teams WHERE name = '${team}'`, { type: QueryTypes.SELECT })
            if (teamres.length < 1) {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setTitle("Error During Hire").setDescription("The team you requested does not exist in our system. Please try again, being mindful of capitalization and punctuation if necessary.")]
                })
            }
        }
        if (team) {
            const fn = interaction.options.getString("firstname")
            const ln = interaction.options.getString("lastname")
            const dpt = interaction.options.getString("department")
            const em = interaction.options.getString("email")
            
            await dbSql.query(`INSERT INTO stafffiles (
                name, companyEmail, DepartmentId, 
                TeamId, PositionId, createdAt, updatedAt
              ) 
              VALUES 
                (
                  '${fn} ${ln}', '${em}', ${deptres[0][ "id" ]}, 
                  ${teamres[0][ "id" ]}, ${posres[0][ "id" ]}, 
                  now(), now()
                );
              INSERT INTO positionhistories (
                title, dept, team, joined, quit, StaffFileId, 
                DepartmentId, createdAt, updatedAt, 
                PositionId
              ) 
              VALUES 
                (
                  '${posres[0]["title"]}', 
                  '${deptres[0]["name"]}', 
                  '${teamres[0]["name"]}', 
                  now(), 
                  null, 
                  (
                    SELECT 
                      id 
                    FROM 
                      stafffiles 
                    WHERE 
                      name = '${fn} ${ln}' 
                    LIMIT 
                      1
                  ), (
                    SELECT 
                      id 
                    FROM 
                      departments 
                    WHERE 
                      name = '${dpt}' 
                    LIMIT 
                      1
                  ), now(), 
                  now(), 
                  ${posres[0][ "id" ]}
                );
              INSERT INTO positionstaff (
                StaffFileId, PositionId, createdAt, 
                updatedAt
              ) 
              VALUES 
                (
                  (
                    SELECT 
                      id 
                    FROM 
                      stafffiles 
                    WHERE 
                      name = '${fn} ${ln}'
                  ), 
                  ${posres[0][ "id" ]}, 
                  now(), 
                  now()
                )
              `).then(() => {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setTitle("Done!").setDescription(`The user was successfully hired in ${sw.stop().toString()}`).setColor("Green")]
                })
            }).catch(err => {
                console.log(err)
                return interaction.reply({
                    embeds: [new EmbedBuilder().setTitle("Error During Query").setDescription(`There was an unexpected error during raw querying:\n\n${err}`)]
                })
            })
        }
        
    }
}