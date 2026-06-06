const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member for a specific duration')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to timeout').setRequired(true))
    .addStringOption(opt =>
      opt.setName('duration').setDescription('Duration (e.g. 10m, 1h, 7d)').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason').setRequired(false))
    .addBooleanOption(opt =>
      opt.setName('silent').setDescription('Skip DMing the user').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    await interaction.deferReply();

    const member = interaction.options.getMember('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const silent = interaction.options.getBoolean('silent') ?? false;

    if (!member) return interaction.editReply({ content: '❌ User not found.' });
    if (!member.moderatable) return interaction.editReply({ content: '❌ I cannot timeout this user.' });

    const duration = ms(durationStr);
    if (!duration || duration < 10000 || duration > 28 * 24 * 60 * 60 * 1000) {
      return interaction.editReply({ content: '❌ Duration must be between 10s and 28d.' });
    }

    if (!silent) {
      try {
        await member.user.send({
          embeds: [new EmbedBuilder()
            .setTitle(`⏱️ You were timed out in ${interaction.guild.name}`)
            .addFields(
              { name: 'Duration', value: durationStr, inline: true },
              { name: 'Reason', value: reason, inline: true },
            )
            .setColor('Blue').setTimestamp()]
        });
      } catch (_) {}
    }

    try {
      await member.timeout(duration, reason);

      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('⏱️ Member Timed Out')
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: 'Duration', value: durationStr, inline: true },
            { name: 'Expires', value: `<t:${Math.floor((Date.now() + duration) / 1000)}:R>`, inline: true },
            { name: 'Reason', value: reason },
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          )
          .setColor('Blue').setTimestamp()]
      });

      await logToChannel(interaction.guild, {
        title: '⏱️ User Timed Out',
        thumbnail: member.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: 'User', value: `<@${member.id}> (${member.user.tag})`, inline: true },
          { name: 'Duration', value: durationStr, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Reason', value: reason },
        ],
        color: 'Blue'
      });
    } catch (err) {
      await interaction.editReply({ content: `❌ Timeout failed: ${err.message}` });
    }
  }
};
