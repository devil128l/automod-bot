const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('View the current automod configuration for this server'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    let settings = await GuildSettings.findOne({ guildId });
    if (!settings) {
      settings = new GuildSettings({ guildId });
      await settings.save();
    }

    const on = '✅ Enabled';
    const off = '❌ Disabled';
    const flag = (v) => v ? on : off;

    const logCh = settings.logChannelId ? `<#${settings.logChannelId}>` : 'Not set';
    const warnAction = {
      none: 'None',
      timeout: `Timeout (${Math.round(settings.warnActionDuration / 60000)}m)`,
      kick: 'Kick',
      ban: 'Ban'
    }[settings.warnAction] || 'None';

    const embed = new EmbedBuilder()
      .setTitle(`⚙️ Server Config — ${interaction.guild.name}`)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setColor('Blue')
      .addFields(
        { name: '🛡️ Automod', value: flag(settings.automodEnabled), inline: true },
        { name: '🔗 Anti-Link', value: flag(settings.antiLink), inline: true },
        { name: '🚨 Anti-Spam', value: flag(settings.antiSpam), inline: true },
        { name: '👻 Anti-Ghost Ping', value: flag(settings.antiGhostPing), inline: true },
        { name: '📨 Spam Threshold', value: `${settings.spamThreshold} msgs / ${settings.spamInterval / 1000}s`, inline: true },
        { name: '⚠️ Warn Threshold', value: `${settings.warnThreshold} warns → ${warnAction}`, inline: true },
        { name: '📋 Log Channel', value: logCh, inline: false },
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
