import {
	ChatInputCommandInteraction,
	Embed,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import StaffFileQueryRoutes from "../routes/StaffFileQueryRoutes"
import sendError from "../utils/sendError"
import { Stopwatch } from "@sapphire/stopwatch"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("add-staff")
		.setDescription(
			"Adds someone to the database. Should be used purely for syncing existing staff."
		)
		.addStringOption((opt) =>
			opt
				.setName("full-name")
				.setDescription("The user's full name.")
				.setRequired(true)
		)
		.addStringOption((opt) =>
			opt
				.setName("position")
				.setDescription("The user's SS position.")
				.setRequired(true)
		)
		.addStringOption((opt) =>
			opt
				.setName("department")
				.setDescription("The user's department.")
				.setRequired(true)
		)
		.addStringOption((opt) =>
			opt
				.setName("discord-user")
				.setDescription("The user's Discord username with tag (xyz#xxxx).")
				.setRequired(true)
		)
		.addStringOption((opt) =>
			opt
				.setName("discord-id")
				.setDescription("The user's Discord ID.")
				.setRequired(true)
		)
		.addStringOption((opt) =>
			opt
				.setName("team")
				.setDescription("Opt -> The user's team.")
				.setRequired(false)
		)
		.addBooleanOption((opt) =>
			opt
				.setName("supervisor")
				.setDescription("Opt -> is the target a supervisor?")
				.setRequired(false)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			const sw = new Stopwatch().start()
			const fullname = interaction.options.getString("full-name") as string
			const position = interaction.options.getString("position") as string
			const department = interaction.options.getString("department") as string
			const user = interaction.options.getString("discord-user") as string
			const id = interaction.options.getString("discord-id") as string
			const team = interaction.options.getString("team") as string
			const supervisor = interaction.options.getBoolean("supervisor") ?? false
			if (interaction.user.id !== "413462464022446084") return
			await interaction.reply({
				embeds: [new EmbedBuilder().setTitle("Please wait...").setColor("Blue")],
			})
			if (team) {
				await new StaffFileQueryRoutes()
					.createStaffFile(
						fullname,
						"Active",
						department,
						position,
						user,
						id,
						team
					)
					.then(async () => {
						if (supervisor) {
							await new StaffFileQueryRoutes()
								.assignSupervisor(`${fullname}`, `${position}`)
								.then(() => {
									return interaction.editReply({
										embeds: [
											new EmbedBuilder()
												.setTitle("Finished")
												.setDescription(`Finished creating staff profile in ${sw.stop().toString()}`)
												.setColor("Green"),
										],
									})
								})
								.catch((err: Error) => {
									console.log(err)
									return interaction.editReply({
										embeds: [
											new EmbedBuilder()
												.setTitle("Encountered Error")
												.setDescription(
													`The bot encountered an error during querying:\n\n${err}`
												),
										],
									})
								})
						} else {
							return interaction.editReply({
								embeds: [
									new EmbedBuilder()
										.setTitle("Finished")
										.setDescription(`Finished creating staff profile in ${sw.stop().toString()}`)
										.setColor("Green"),
								],
							})
						}
					})
					.catch((err: Error) => {
						console.log(err)
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setTitle("Encountered Error")
									.setDescription(
										`The bot encountered an error during querying:\n\n${err}`
									),
							],
						})
					})
			} else {
				await new StaffFileQueryRoutes()
					.createStaffFile(
						fullname,
						"Active",
						department,
						position,
						user,
						id
					)
					.then(async () => {
						if (supervisor) {
							await new StaffFileQueryRoutes()
								.assignSupervisor(`${fullname}`, `${position}`)
								.then(() => {
									return interaction.editReply({
										embeds: [
											new EmbedBuilder()
												.setTitle("Finished")
												.setDescription(`Finished creating staff profile in ${sw.stop().toString()}`)
												.setColor("Green"),
										],
									})
								})
								.catch((err: Error) => {
									console.log(err)
									return interaction.editReply({
										embeds: [
											new EmbedBuilder()
												.setTitle("Encountered Error")
												.setDescription(
													`The bot encountered an error during querying:\n\n${err}`
												),
										],
									})
								})
						} else {
							return interaction.editReply({
								embeds: [
									new EmbedBuilder()
										.setTitle("Finished")
										.setDescription(`Finished creating staff profile in ${sw.stop().toString()}`)
										.setColor("Green"),
								],
							})
						}
					})
					.catch((err: Error) => {
						console.log(err)
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setTitle("Encountered Error")
									.setDescription(
										`The bot encountered an error during querying:\n\n${err}`
									),
							],
						})
					})
			}
		} catch (err) {
			sendError(err, interaction, true)
		}
	},
}
