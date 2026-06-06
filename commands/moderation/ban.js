const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for the ban').setRequired(false))
    .addIntegerOption(opt =>
      opt.setName('days')
        .setDescription('Days of messages to delete (0–7, default 0)')
        .setMinValue(0).setMaxValue(7).setRequired(false))
    .addBooleanOption(opt =>
      opt.setName('silent').setDescription('Skip DMing the user').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    await interaction.deferReply();

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') ?? 0;
    const silent = interaction.options.getBoolean('silent') ?? false;

    const member = interaction.guild.members.cache.get(user.id);
    if (member) {
      if (!member.bannable)
        return interaction.editReply({ content: '❌ I cannot ban this user (role hierarchy or missing perms).' });
      if (member.id === interaction.user.id)
        return interaction.editReply({ content: '❌ You cannot ban yourself.' });
    }

    if (!silent) {
      try {
        await user.send({
          embeds: [new EmbedBuilder()
            .setTitle(`🔨 You were banned from ${interaction.guild.name}`)
            .setDescription(`**Reason:** ${reason}`)
            .setColor('Red').setTimestamp()]
        });
      } catch (_) {}
    }

    try {
      await interaction.guild.members.ban(user.id, { reason, deleteMessageSeconds: days * 86400 });

      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('🔨 Member Banned')
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
            { name: 'Reason', value: reason },
            { name: 'Messages Deleted', value: `${days} day(s)`, inline: true },
            { name: 'DM Sent', value: silent ? 'No' : 'Yes', inline: true },
          )
          .setColor('Red').setTimestamp()]
      });

      await logToChannel(interaction.guild, {
        title: '🔨 User Banned',
        thumbnail: user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Reason', value: reason },
          { name: 'Messages Deleted', value: `${days} day(s)`, inline: true },
        ],
        color: 'Red'
      });
    } catch (err) {
      await interaction.editReply({ content: `❌ Failed to ban: ${err.message}` });
    }
  }
};
