const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Toggle the automod system and configure warn auto-actions')
    .addSubcommand(sub =>
      sub.setName('toggle')
        .setDescription('Enable or disable automod'))
    .addSubcommand(sub =>
      sub.setName('warnaction')
        .setDescription('Set the automatic action when a user hits the warn threshold')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Action to take')
            .setRequired(true)
            .addChoices(
              { name: 'None', value: 'none' },
              { name: 'Timeout', value: 'timeout' },
              { name: 'Kick', value: 'kick' },
              { name: 'Ban', value: 'ban' },
            ))
        .addIntegerOption(opt =>
          opt.setName('threshold')
            .setDescription('Number of warns before action is taken (default: 3)')
            .setMinValue(1)
            .setMaxValue(20)
            .setRequired(false))
        .addIntegerOption(opt =>
          opt.setName('duration')
            .setDescription('Timeout duration in minutes (only for timeout action, default: 60)')
            .setMinValue(1)
            .setMaxValue(40320)
            .setRequired(false)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    let settings = await GuildSettings.findOne({ guildId }) || new GuildSettings({ guildId });

    if (sub === 'toggle') {
      settings.automodEnabled = !settings.automodEnabled;
      await settings.save();

      const enabled = settings.automodEnabled;
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle(`🛡️ Automod ${enabled ? 'Enabled' : 'Disabled'}`)
          .setDescription(
            enabled
              ? 'Automod is now active. Anti-spam, anti-link, and ghost ping detection will work if individually enabled.'
              : 'Automod has been fully disabled for this server.'
          )
          .setColor(enabled ? 'Green' : 'Red')
          .setFooter({ text: `Toggled by ${interaction.user.tag}` })
          .setTimestamp()],
        ephemeral: true
      });
    }

    if (sub === 'warnaction') {
      const action = interaction.options.getString('action');
      const threshold = interaction.options.getInteger('threshold');
      const duration = interaction.options.getInteger('duration');

      settings.warnAction = action;
      if (threshold) settings.warnThreshold = threshold;
      if (duration) settings.warnActionDuration = duration * 60000;
      await settings.save();

      const actionLabel = {
        none: 'No action',
        timeout: `Timeout for ${Math.round(settings.warnActionDuration / 60000)} minutes`,
        kick: 'Kick from server',
        ban: 'Ban from server',
      }[action];

      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('⚠️ Warn Action Configured')
          .addFields(
            { name: 'Threshold', value: `${settings.warnThreshold} warnings`, inline: true },
            { name: 'Action', value: actionLabel, inline: true },
          )
          .setColor('Orange')
          .setFooter({ text: `Updated by ${interaction.user.tag}` })
          .setTimestamp()],
        ephemeral: true
      });
    }
  }
};
