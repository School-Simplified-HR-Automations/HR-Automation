import Discord, {
	ButtonInteraction,
	CommandInteraction,
	Message,
	EmbedBuilder,
	ChatInputCommandInteraction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
} from "discord.js"

const sendError = (
	e: any,
	type:
		| CommandInteraction
		| ButtonInteraction
		| Message
		| ChatInputCommandInteraction
		| ModalSubmitInteraction
		| SelectMenuInteraction,
	def?: boolean
) => {
	const errorEmbed = new EmbedBuilder()
		.setTitle("Error During Execution")
		.setDescription(
			`Oops! It appears the bot encountered an error while handling that request. No worries, you can continue to use the bot as normal - the log is attached for you to send to the Support team.\n\nError:\n\`\`\`${e}\`\`\``
		)
		.setColor("Red")
		if (type instanceof ModalSubmitInteraction) {
			return type.reply({ embeds: [errorEmbed] })
		}
		if (def && type instanceof ChatInputCommandInteraction) {
			return type.editReply({ embeds: [errorEmbed] })
		}
	return type.channel?.send({ embeds: [errorEmbed] })
}

export default sendError
