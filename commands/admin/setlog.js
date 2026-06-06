const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Manage the moderation log channel')
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set the log channel')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Text channel to send logs to')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('clear')
        .setDescription('Remove the current log channel'))
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('View the current log channel'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    let settings = await GuildSettings.findOne({ guildId }) || new GuildSettings({ guildId });

    if (sub === 'set') {
      const channel = interaction.options.getChannel('channel');
      settings.logChannelId = channel.id;
      await settings.save();
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('✅ Log Channel Set')
          .setDescription(`Moderation logs will now be sent to ${channel}.`)
          .setColor('Green')
          .setFooter({ text: `Set by ${interaction.user.tag}` })
          .setTimestamp()],
        ephemeral: true
      });
    }

    if (sub === 'clear') {
      settings.logChannelId = null;
      await settings.save();
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('🗑️ Log Channel Cleared')
          .setDescription('Moderation logging has been disabled.')
          .setColor('Red')
          .setTimestamp()],
        ephemeral: true
      });
    }

    if (sub === 'view') {
      const ch = settings.logChannelId ? `<#${settings.logChannelId}>` : 'Not configured';
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('📋 Current Log Channel')
          .setDescription(`Log channel: **${ch}**`)
          .setColor('Blue')
          .setTimestamp()],
        ephemeral: true
      });
    }
  }
};
