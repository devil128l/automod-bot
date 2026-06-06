const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency and API response time'),

  async execute(interaction, client) {
    const sent = await interaction.reply({ content: '📡 Pinging...', fetchReply: true });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const apiPing = client.ws.ping;

    const pingColor = apiPing < 100 ? 0x57F287 : apiPing < 250 ? 0xFEE75C : 0xED4245;

    await interaction.editReply({
      content: null,
      embeds: [new EmbedBuilder()
        .setTitle('🏓 Pong!')
        .setColor(pingColor)
        .addFields(
          { name: '↩️ Roundtrip', value: `${roundtrip}ms`, inline: true },
          { name: '📡 WebSocket', value: `${apiPing}ms`, inline: true },
          { name: '📊 Status', value: apiPing < 100 ? '🟢 Excellent' : apiPing < 250 ? '🟡 Good' : '🔴 High', inline: true },
        )
        .setTimestamp()]
    });
  }
};
