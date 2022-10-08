import {
	ChatInputCommandInteraction,
	Embed,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import StaffFileQueryRoutes from "../routes/StaffFileQueryRoutes"
import sendError from "../utils/sendError"

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
				.setName("ss-email")
				.setDescription("The user's School Simplified email address.")
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
				.setName("team")
				.setDescription("Opt -> The user's team.")
				.setRequired(false)
		)
		.addStringOption((opt) =>
			opt
				.setName("p-email")
				.setDescription("Opt -> The user's personal email.")
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
			const fullname = interaction.options.getString("full-name")
			const email = interaction.options.getString("ss-email")
			const position = interaction.options.getString("position")
			const department = interaction.options.getString("department")
			const team = interaction.options.getString("team")
			const pemail = interaction.options.getString("p-email")
			const supervisor = interaction.options.getBoolean("supervisor") ?? false
			if (interaction.user.id !== "413462464022446084") return
			await interaction.reply({
				embeds: [new EmbedBuilder().setTitle("Please wait...").setColor("Blue")],
			})
			if (team) {
				await new StaffFileQueryRoutes()
					.createStaffFile(
						`${fullname}`,
						"Active",
						`${department}`,
						`${position}`,
						`${email}`,
						`${team}`
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
												.setDescription("Finished creating staff profile.")
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
										.setDescription("Finished creating staff profile.")
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
						`${fullname}`,
						"Active",
						`${department}`,
						`${position}`,
						`${email}`
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
												.setDescription("Finished creating staff profile.")
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
										.setDescription("Finished creating staff profile.")
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
