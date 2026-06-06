const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout (mute) a member for a specified duration')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Member to mute').setRequired(true))
    .addStringOption(opt =>
      opt.setName('duration')
        .setDescription('Duration (e.g. 10m, 1h, 1d — max 28d)')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for mute').setRequired(false))
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
    if (!member.moderatable) return interaction.editReply({ content: '❌ I cannot mute this user.' });

    const duration = ms(durationStr);
    if (!duration || duration < 10000 || duration > 28 * 24 * 60 * 60 * 1000) {
      return interaction.editReply({ content: '❌ Invalid duration. Use formats like `10m`, `1h`, `1d` (between 10s and 28d).' });
    }

    if (!silent) {
      try {
        await member.user.send({
          embeds: [new EmbedBuilder()
            .setTitle(`🔇 You were muted in ${interaction.guild.name}`)
            .addFields(
              { name: 'Duration', value: durationStr, inline: true },
              { name: 'Reason', value: reason, inline: true },
            )
            .setColor('Orange').setTimestamp()]
        });
      } catch (_) {}
    }

    try {
      await member.timeout(duration, reason);

      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('🔇 Member Muted')
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: 'Duration', value: durationStr, inline: true },
            { name: 'Reason', value: reason },
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
            { name: 'Expires', value: `<t:${Math.floor((Date.now() + duration) / 1000)}:R>`, inline: true },
          )
          .setColor('Orange').setTimestamp()]
      });

      await logToChannel(interaction.guild, {
        title: '🔇 User Muted',
        thumbnail: member.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: 'User', value: `<@${member.id}> (${member.user.tag})`, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Duration', value: durationStr, inline: true },
          { name: 'Reason', value: reason },
        ],
        color: 'Orange'
      });
    } catch (err) {
      await interaction.editReply({ content: `❌ Failed to mute: ${err.message}` });
    }
  }
};
