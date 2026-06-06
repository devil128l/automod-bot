const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antispam')
    .setDescription('Toggle anti-spam protection and configure its threshold')
    .addSubcommand(sub =>
      sub.setName('toggle')
        .setDescription('Enable or disable anti-spam'))
    .addSubcommand(sub =>
      sub.setName('config')
        .setDescription('Configure spam detection settings')
        .addIntegerOption(opt =>
          opt.setName('messages')
            .setDescription('Number of messages that triggers spam detection (default: 5)')
            .setMinValue(2)
            .setMaxValue(20)
            .setRequired(false))
        .addIntegerOption(opt =>
          opt.setName('interval')
            .setDescription('Time window in seconds (default: 5)')
            .setMinValue(2)
            .setMaxValue(30)
            .setRequired(false)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    let settings = await GuildSettings.findOne({ guildId }) || new GuildSettings({ guildId });

    if (sub === 'toggle') {
      settings.antiSpam = !settings.antiSpam;
      await settings.save();

      const enabled = settings.antiSpam;
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle(`🚨 Anti-Spam ${enabled ? 'Enabled' : 'Disabled'}`)
          .setDescription(
            enabled
              ? `Spam detection is active. Triggers at **${settings.spamThreshold} messages** in **${settings.spamInterval / 1000}s**.`
              : 'Spam detection has been turned off.'
          )
          .setColor(enabled ? 'Green' : 'Red')
          .setFooter({ text: `Toggled by ${interaction.user.tag}` })
          .setTimestamp()],
        ephemeral: true
      });
    }

    if (sub === 'config') {
      const msgs = interaction.options.getInteger('messages');
      const interval = interaction.options.getInteger('interval');

      if (msgs) settings.spamThreshold = msgs;
      if (interval) settings.spamInterval = interval * 1000;
      await settings.save();

      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('⚙️ Anti-Spam Configured')
          .addFields(
            { name: 'Message Threshold', value: `${settings.spamThreshold} messages`, inline: true },
            { name: 'Time Window', value: `${settings.spamInterval / 1000} seconds`, inline: true },
          )
          .setColor('Blue')
          .setFooter({ text: `Updated by ${interaction.user.tag}` })
          .setTimestamp()],
        ephemeral: true
      });
    }
  }
};
