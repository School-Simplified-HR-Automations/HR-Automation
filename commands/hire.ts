import { Stopwatch } from "@sapphire/stopwatch";
import {
  ChatInputCommandInteraction,
  Embed,
  EmbedBuilder,
  InteractionResponse,
  SlashCommandBuilder,
} from "discord.js";
import { QueryTypes } from "sequelize";
import { dbSql, Department, StaffFile, Team } from "..";
import {
  Department as DepartmentType,
  Position,
  Team as TeamType,
} from "../types/common/ReturnTypes";
import nodemailer from "nodemailer";
import StaffFileQueryRoutes from "../routes/StaffFileQueryRoutes";
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hire")
    .setDescription("Hires a user via a suite of actions.")
    .addStringOption((opt) =>
      opt
        .setName("firstname")
        .setDescription("The hire's first name")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("lastname")
        .setDescription("The hire's last name")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("email").setDescription("The hire's email").setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("position")
        .setDescription("The hire's position")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("department")
        .setDescription("The hire's department")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("team").setDescription("The hire's team").setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("discord-id")
        .setDescription("The hire's Discord ID.")
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setTitle("Please wait...").setColor("Blue")],
    });
    const sw = new Stopwatch(2).start();
    let team = interaction.options.getString("team");
    const posres: Position[] = await dbSql.query(
      `SELECT * FROM positions WHERE title = '${interaction.options.getString(
        "position"
      )}'`,
      { type: QueryTypes.SELECT }
    );
    if (posres.length < 1) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error During Hire")
            .setDescription(
              "The position you requested does not exist in our system. Please try again, being mindful of capitalization and punctuation if necessary."
            ),
        ],
      });
    }
    const deptres: DepartmentType[] = await dbSql.query(
      `SELECT * FROM departments WHERE name = '${interaction.options.getString(
        "department"
      )}'`,
      { type: QueryTypes.SELECT }
    );
    if (deptres.length < 1) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error During Hire")
            .setDescription(
              "The department you requested does not exist in our system. Please try again, being mindful of capitalization and punctuation if necessary."
            ),
        ],
      });
    }
    let teamres: TeamType[] = [];
    if (team) {
      teamres = await dbSql.query(
        `SELECT * FROM teams WHERE name = '${team}'`,
        { type: QueryTypes.SELECT }
      );
      if (teamres.length < 1) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Error During Hire")
              .setDescription(
                "The team you requested does not exist in our system. Please try again, being mindful of capitalization and punctuation if necessary."
              ),
          ],
        });
      }
    }
    if (team) {
      const fn = interaction.options.getString("firstname");
      const ln = interaction.options.getString("lastname");
      const dpt = interaction.options.getString("department");
      const em = interaction.options.getString("email");
      const pos = interaction.options.getString("position");

      await dbSql
        .query(
          `INSERT INTO stafffiles (
                name, personalEmail, DepartmentId, 
                TeamId, PositionId, createdAt, updatedAt
              ) 
              VALUES 
                (
                  '${fn} ${ln}', '${em}', ${deptres[0]["id"]}, 
                  ${teamres[0]["id"]}, ${posres[0]["id"]}, 
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
                  ${posres[0]["id"]}
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
                  ${posres[0]["id"]}, 
                  now(), 
                  now()
                )
              `
        )
        .catch((err) => {
          console.log(err);
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Error During Query")
                .setDescription(
                  `There was an unexpected error during raw querying:\n\n${err}`
                ),
            ],
          });
        });

      const tpt = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: `${process.env.HIRE_EMAIL}`,
          pass: `${process.env.HIRE_APP_PW}`,
        },
      });
      var msg = {
        from: `hiring@schoolsimplified.org`,
        to: `${em}`,
        subject: `Your ${pos} Application`,
        text: `Dear ${fn} ${ln},
        
        Congratulations! Upon reviewing your application and/or interview, we are excited to welcome you onboard School Simplified as a member of our ${dpt} Department, in the role of ${pos}. We cannot wait to begin working with you!
        
        Here's what you can do right now:
        - Join the School Simplified Trainee Program Discord server and state your roles upon joining. This can be found at https://discord.gg/P8mPApwak6.
        - Join our Google Classroom and complete all tasks assigned. You must complete all tasks before you can be promoted from a Trainee to an Associate. Note that you must have a Google Account to join. You must also join from a personal account. To join, go to classroom.google.com and use code 6vpj4cp.
        - Read over and sign the contract located in Google Classroom. This should be attached with the “Employee Profile” assignment.
        - For more information on School Simplified and the resources that are available to you, check out our Employee Handbook, located at https://ssimpl.org/EmployeeHandbook.
        - Once all tasks are completed and your contract is submitted, please wait until your due date mentioned in this email. Our Human Resources team will check for completion on this day. If your documents meet our requirements, you will be given the necessary resources vital to your School Simplified career.
        - You have 7 days to complete the tasks assigned to you. Therefore, it is crucial that they are completed as soon as possible. Failure to complete them on time will result in a removal from the trainee program.
        
        For any questions or concerns, don't hesitate to contact a member of Human Resources, or your team manager!
        
        On behalf of all of us at School Simplified, welcome to the team!
        
        Regards,
        
        School Simplified Human Resources
        Hiring Team`,
        html: `<p>Dear ${fn} ${ln},
        <br/>
        <br/>
  <b>Congratulations!</b> Upon reviewing your application and/or interview, we are excited to welcome you onboard School Simplified as a member of our <u>${dpt}</u> Department, in the role of <u>${pos}</u>. We cannot wait to begin working with you!
        <br/>
        <br/>
  Here's what you can do right now:
  <ul>
      <li>Join the School Simplified Trainee Program Discord server and state your roles upon joining. This can be found <a href="https://discord.gg/P8mPApwak6.">here.</a></li>
      <li>Join our Google Classroom and complete all tasks assigned. You must complete all tasks before you can be promoted from a Trainee to an Associate. Note that you must have a Google Account to join. You must also join from a personal account. To join, go to classroom.google.com and use code 6vpj4cp.</li>
      <li>Read over and sign the contract located in Google Classroom. This should be attached with the “Employee Profile” assignment.</li>
      <li>For more information on School Simplified and the resources that are available to you, check out our Employee Handbook, located <a href="https://ssimpl.org/EmployeeHandbook.">here.</a></li>
      <li>Once all tasks are completed and your contract is submitted, please wait until your due date mentioned in this email. Our Human Resources team will check for completion on this day. If your documents meet our requirements, you will be given the necessary resources vital to your School Simplified career.</li>
      <li><b>You have 7 days to complete the tasks assigned to you.</b> Therefore, it is crucial that they are completed as soon as possible. Failure to complete them on time will result in a removal from the trainee program.</li>
  </ul>
        <br/>
  For any questions or concerns, don't hesitate to contact a member of Human Resources, or your team manager!
        <br/>
        <br/>
  On behalf of all of us at School Simplified, welcome to the team!
        <br/>
        <br/>
  Regards,
        <br/>
        <br/>
  <i>School Simplified Human Resources</i>
        <br/>
  <i>Hiring Team</i>
      </p>`,
      };
      // await tpt.sendMail(msg, function (err: any, msg: any) {
      // if (err) return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("Error During Email").setDescription(`The user could not be emailed, but their hiring has still been logged. The error is as follows:\n\n${err}`).setColor("Red")]})
      // })
      const did = interaction.options.getString("discord-id");
      if (did) {
        await (
          await interaction.client.users.fetch(`${did}`)
        ).send({
          content:
            "Hello there! Thanks for your application to our team at School Simplified. Please check the personal email you listed on your application for a status update. Thanks!\n\nRegards,\nHuman Resources",
        });
      }
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Done!")
            .setDescription(
              `The user was successfully hired in ${sw.stop().toString()}`
            )
            .setColor("Green"),
        ],
      });
    }
  },
};
