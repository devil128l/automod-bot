const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove timeout from a member')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Member to unmute').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    await interaction.deferReply();

    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member) return interaction.editReply({ content: '❌ User not found.' });
    if (!member.isCommunicationDisabled()) {
      return interaction.editReply({ content: '❌ This user is not currently muted.' });
    }

    try {
      await member.timeout(null, reason);

      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('🔊 Member Unmuted')
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
            { name: 'Reason', value: reason },
          )
          .setColor('Green').setTimestamp()]
      });

      await logToChannel(interaction.guild, {
        title: '🔊 User Unmuted',
        thumbnail: member.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: 'User', value: `<@${member.id}> (${member.user.tag})`, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Reason', value: reason },
        ],
        color: 'Green'
      });
    } catch (err) {
      await interaction.editReply({ content: `❌ Failed to unmute: ${err.message}` });
    }
  }
};
