const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Shows how long the bot has been online'),

  async execute(interaction, client) {
    const totalSeconds = Math.floor(client.uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const startTime = Math.floor((Date.now() - client.uptime) / 1000);

    const embed = new EmbedBuilder()
      .setTitle('⏱️ Bot Uptime')
      .setColor(0x57F287)
      .addFields(
        { name: '🕒 Online For', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: '📅 Started', value: `<t:${startTime}:F>`, inline: true },
        { name: '🔄 Since', value: `<t:${startTime}:R>`, inline: true },
        { name: '🏓 Current Ping', value: `${client.ws.ping}ms`, inline: true },
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
