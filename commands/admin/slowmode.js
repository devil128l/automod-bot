const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set or remove slowmode in a channel')
    .addIntegerOption(opt =>
      opt.setName('seconds')
        .setDescription('Slowmode delay in seconds (0 to disable, max 21600)')
        .setMinValue(0).setMaxValue(21600).setRequired(true))
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel to set slowmode in (defaults to current channel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    try {
      await channel.setRateLimitPerUser(seconds, `Set by ${interaction.user.tag}`);

      const label = seconds === 0 ? 'Disabled' : `${seconds}s`;

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('⏱️ Slowmode Updated')
          .addFields(
            { name: 'Channel', value: `${channel}`, inline: true },
            { name: 'Delay', value: label, inline: true },
            { name: 'Set by', value: `${interaction.user.tag}`, inline: true },
          )
          .setColor(seconds === 0 ? 'Green' : 'Blue')
          .setTimestamp()]
      });

      await logToChannel(interaction.guild, {
        title: '⏱️ Slowmode Changed',
        fields: [
          { name: 'Channel', value: `<#${channel.id}>`, inline: true },
          { name: 'Delay', value: label, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
        ],
        color: 'Blue'
      });
    } catch (err) {
      await interaction.reply({ content: `❌ Failed: ${err.message}`, ephemeral: true });
    }
  }
};
