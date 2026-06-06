const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Warn = require('../../models/Warn');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Clear warnings for a user')
    .addSubcommand(sub =>
      sub.setName('all')
        .setDescription('Clear all warnings for a user')
        .addUserOption(opt => opt.setName('user').setDescription('User to clear').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('one')
        .setDescription('Remove a specific warning by ID')
        .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
        .addStringOption(opt => opt.setName('warn_id').setDescription('Warning ID (from /warnings)').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    const guildId = interaction.guild.id;

    if (sub === 'all') {
      const result = await Warn.findOneAndDelete({ userId: user.id, guildId });

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('🧹 All Warnings Cleared')
          .setDescription(result
            ? `Cleared **${result.warnings.length}** warning(s) for ${user.tag}.`
            : `No warnings found for ${user.tag}.`)
          .setColor('Green').setTimestamp()]
      });

      await logToChannel(interaction.guild, {
        title: '🧹 All Warnings Cleared',
        fields: [
          { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Cleared', value: `${result?.warnings?.length ?? 0} warning(s)`, inline: true },
        ],
        color: 'Green'
      });
    }

    if (sub === 'one') {
      const warnId = interaction.options.getString('warn_id');
      const data = await Warn.findOne({ userId: user.id, guildId });

      if (!data || data.warnings.length === 0) {
        return interaction.reply({ content: '❌ No warnings found for this user.', ephemeral: true });
      }

      const idx = data.warnings.findIndex(w => w.warnId === warnId);
      if (idx === -1) {
        return interaction.reply({ content: `❌ No warning with ID \`${warnId}\` found.`, ephemeral: true });
      }

      data.warnings.splice(idx, 1);
      await data.save();

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('🗑️ Warning Removed')
          .setDescription(`Removed warning \`${warnId}\` from ${user.tag}. They now have **${data.warnings.length}** warning(s).`)
          .setColor('Green').setTimestamp()]
      });

      await logToChannel(interaction.guild, {
        title: '🗑️ Warning Removed',
        fields: [
          { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Warn ID', value: warnId, inline: true },
        ],
        color: 'Green'
      });
    }
  }
};
