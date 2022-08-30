import {
	ChatInputCommandInteraction,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("email")
		.setDescription("Sends various types of emails.")
		.addStringOption((opt) =>
			opt
				.setName("category")
				.setDescription("The category of email to send.")
				.addChoices(
					{ name: "Acceptance Email", value: "acceptance" },
					{ name: "Rejection Email", value: "rejection" },
					{ name: "Waitlist Email", value: "waitlist" }
				)
				.setRequired(true)
		)
		.addStringOption((opt) =>
			opt
				.setName("email")
				.setDescription("Email to send email to.")
				.setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const hirevals = ["acceptance", "rejection", "waitlist"]
		const recipient = interaction.options.getString("email") as string
		if (
			hirevals.includes(interaction.options.getString("category") as string)
		) {
			if (!recipient.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/))
				return interaction.reply({
					content:
						"Error: Invalid or match-syntax violating email address provided.",
				})
			const modal = new ModalBuilder()
				.setCustomId("res")
				.setTitle("Email Details")

			const userDetails = new TextInputBuilder()
				.setCustomId("userdetails")
				.setLabel("Recipient Full Name")
				.setStyle(TextInputStyle.Short)
			const hiredetails = new TextInputBuilder()
				.setCustomId("hiredetails")
				.setLabel("Position Applied For")
				.setStyle(TextInputStyle.Short)
			const deptdetails = new TextInputBuilder()
				.setCustomId("deptdetails")
				.setLabel("Department of Position")
				.setStyle(TextInputStyle.Short)
		}
	},
}
