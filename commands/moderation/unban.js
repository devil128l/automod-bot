const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user by their ID')
    .addStringOption(opt =>
      opt.setName('user_id').setDescription('ID of the user to unban').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for unban').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    await interaction.deferReply();

    const userId = interaction.options.getString('user_id').trim();
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.editReply({ content: '❌ Invalid user ID format.' });
    }

    try {
      const banEntry = await interaction.guild.bans.fetch(userId).catch(() => null);
      if (!banEntry) return interaction.editReply({ content: '❌ This user is not banned.' });

      await interaction.guild.members.unban(userId, reason);

      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('🔓 Member Unbanned')
          .addFields(
            { name: 'User', value: `${banEntry.user.tag} (${userId})`, inline: true },
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
            { name: 'Reason', value: reason },
          )
          .setColor('Green').setTimestamp()]
      });

      await logToChannel(interaction.guild, {
        title: '🔓 User Unbanned',
        fields: [
          { name: 'User', value: `${banEntry.user.tag} (${userId})`, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Reason', value: reason },
        ],
        color: 'Green'
      });
    } catch (err) {
      await interaction.editReply({ content: `❌ Unban failed: ${err.message}` });
    }
  }
};
