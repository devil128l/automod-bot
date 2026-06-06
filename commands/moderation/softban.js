const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Softban a member (ban + instant unban to delete their messages)')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to softban').setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('days')
        .setDescription('Days of messages to delete (1–7, default 1)')
        .setMinValue(1).setMaxValue(7).setRequired(false))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    await interaction.deferReply();

    const user = interaction.options.getUser('user');
    const days = interaction.options.getInteger('days') ?? 1;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = interaction.guild.members.cache.get(user.id);
    if (member && !member.bannable) {
      return interaction.editReply({ content: '❌ I cannot ban this user.' });
    }

    try {
      await user.send({
        embeds: [new EmbedBuilder()
          .setTitle(`🔨 You were softbanned from ${interaction.guild.name}`)
          .setDescription(`**Reason:** ${reason}\nYou may rejoin with an invite link.`)
          .setColor('Orange').setTimestamp()]
      }).catch(() => {});

      await interaction.guild.members.ban(user.id, { reason, deleteMessageSeconds: days * 86400 });
      await interaction.guild.members.unban(user.id, 'Softban — auto unban');

      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('🔨 Member Softbanned')
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setDescription('User was banned and immediately unbanned. Their recent messages were deleted.')
          .addFields(
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
            { name: 'Messages Deleted', value: `${days} day(s)`, inline: true },
            { name: 'Reason', value: reason },
          )
          .setColor('Orange').setTimestamp()]
      });

      await logToChannel(interaction.guild, {
        title: '🔨 User Softbanned',
        thumbnail: user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Reason', value: reason },
        ],
        color: 'Orange'
      });
    } catch (err) {
      await interaction.editReply({ content: `❌ Softban failed: ${err.message}` });
    }
  }
};
