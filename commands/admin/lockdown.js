const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lock or unlock a channel for @everyone')
    .addSubcommand(sub =>
      sub.setName('lock')
        .setDescription('Prevent @everyone from sending messages')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel to lock (defaults to current)')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false))
        .addStringOption(opt =>
          opt.setName('reason').setDescription('Reason for lockdown').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('unlock')
        .setDescription('Restore @everyone send message permissions')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel to unlock (defaults to current)')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false))
        .addStringOption(opt =>
          opt.setName('reason').setDescription('Reason for unlocking').setRequired(false)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const everyone = interaction.guild.roles.everyone;

    try {
      if (sub === 'lock') {
        await channel.permissionOverwrites.edit(everyone, { SendMessages: false }, { reason });

        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle('🔒 Channel Locked')
            .setDescription(`${channel} has been locked. Members cannot send messages.`)
            .addFields({ name: 'Reason', value: reason })
            .setColor('Red').setTimestamp()]
        });

        await channel.send({
          embeds: [new EmbedBuilder()
            .setTitle('🔒 This channel has been locked')
            .setDescription(`**Reason:** ${reason}\n\nOnly staff members can send messages.`)
            .setColor('Red')]
        }).catch(() => {});

      } else {
        await channel.permissionOverwrites.edit(everyone, { SendMessages: null }, { reason });

        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle('🔓 Channel Unlocked')
            .setDescription(`${channel} has been unlocked. Members can send messages again.`)
            .addFields({ name: 'Reason', value: reason })
            .setColor('Green').setTimestamp()]
        });

        await channel.send({
          embeds: [new EmbedBuilder()
            .setTitle('🔓 This channel has been unlocked')
            .setDescription('You may now send messages again.')
            .setColor('Green')]
        }).catch(() => {});
      }

      await logToChannel(interaction.guild, {
        title: sub === 'lock' ? '🔒 Channel Locked' : '🔓 Channel Unlocked',
        fields: [
          { name: 'Channel', value: `<#${channel.id}>`, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Reason', value: reason },
        ],
        color: sub === 'lock' ? 'Red' : 'Green'
      });
    } catch (err) {
      await interaction.reply({ content: `❌ Failed: ${err.message}`, ephemeral: true });
    }
  }
};
