const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antilink')
    .setDescription('Toggle anti-link protection (deletes messages containing URLs)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    let settings = await GuildSettings.findOne({ guildId }) || new GuildSettings({ guildId });

    settings.antiLink = !settings.antiLink;
    await settings.save();

    const enabled = settings.antiLink;
    const embed = new EmbedBuilder()
      .setTitle(`🔗 Anti-Link ${enabled ? 'Enabled' : 'Disabled'}`)
      .setDescription(
        enabled
          ? 'Messages containing URLs will now be automatically deleted.'
          : 'URL filtering has been turned off.'
      )
      .setColor(enabled ? 'Green' : 'Red')
      .setFooter({ text: `Toggled by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
