import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import nodemailer from "nodemailer"
import Tickets from "../models/TicketStorage"
require("dotenv").config()
import ticketGeneration from "../utils/ticketGeneration"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ticket")
		.setDescription("Opens an email ticket with the HR Automations Specialist.")
		.addStringOption((opt) =>
			opt
				.setName("category")
				.setDescription("The category of your inquiry.")
				.addChoices(
					{
						name: "Bot Inquiry",
						value: "bot",
					},
					{
						name: "Database Inquiry",
						value: "database",
					},
					{
						name: "Bug Report",
						value: "bug-report",
					},
					{
						name: "General Inquiry",
						value: "geninq",
					}
				)
				.setRequired(true)
		)
		.addStringOption((opt) =>
			opt
				.setName("response-email")
				.setDescription(
					"The email for us to respond to. Should be your SS email."
				)
				.setRequired(true)
		)
		.addStringOption((opt) =>
			opt
				.setName("message")
				.setDescription("The message to send via the ticket.")
				.setRequired(true)
		)
		.addNumberOption((opt) =>
			opt
				.setName("priority")
				.setDescription("The priority level of this ticket, from 0 to 5.")
				.setMinValue(0)
				.setMaxValue(5)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true })
		if (
			!interaction.options
				.getString("response-email")
				?.match(/[a-z.]{1,}@schoolsimplified.org/)
		) {
			return interaction.editReply({
				content: `This doesn't appear to be your internal SS email --> ${interaction.options.getString(
					"response-email"
				)}\nPlease ensure you're providing that email!`,
			})
		}
		const cat = interaction.options.getString("category")
		const tkt = await Tickets.create({
			author: `${interaction.options.getString("response-email")}`,
			category: `${
				cat == "bot"
					? "bot"
					: cat == "database"
					? "db"
					: cat == "bug-report"
					? "br"
					: "gen"
			}`,
			messages: `${interaction.options.getString("message")}`,
		})
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: `${process.env.USER}`,
				pass: `${process.env.PW}`,
			},
		})
		const mailOptions = ticketGeneration(
			interaction.options.getString("message") as string,
			interaction.options.getString("response-email") as string,
			interaction.options.getString("category") as string,
			interaction.options.getNumber("priority") as number
		)
		transporter.sendMail(mailOptions, function (error: any, info: any) {
			error ? console.log(error) : console.log("New ticket submitted.")
		})
		const selfresponse = ticketGeneration(
			interaction.options.getString("message") as string,
			interaction.options.getString("response-email") as string,
			interaction.options.getString("category") as string,
			interaction.options.getNumber("priority") as number,
			true
		)
		return transporter.sendMail(selfresponse, function (error: any, info: any) {
			error
				? console.log(error)
				: interaction.editReply({ content: "Message sent!" })
		})
	},
}
