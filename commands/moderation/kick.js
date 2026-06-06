const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for the kick').setRequired(false))
    .addBooleanOption(opt =>
      opt.setName('silent').setDescription('Skip DMing the user').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    await interaction.deferReply();

    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const silent = interaction.options.getBoolean('silent') ?? false;

    if (!member) return interaction.editReply({ content: '❌ User not found in this server.' });
    if (!member.kickable) return interaction.editReply({ content: '❌ I cannot kick this user.' });
    if (member.id === interaction.user.id) return interaction.editReply({ content: '❌ You cannot kick yourself.' });

    if (!silent) {
      try {
        await member.user.send({
          embeds: [new EmbedBuilder()
            .setTitle(`👢 You were kicked from ${interaction.guild.name}`)
            .setDescription(`**Reason:** ${reason}`)
            .setColor('Orange').setTimestamp()]
        });
      } catch (_) {}
    }

    await member.kick(reason);

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('👢 Member Kicked')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason },
          { name: 'DM Sent', value: silent ? 'No' : 'Yes', inline: true },
        )
        .setColor('Orange').setTimestamp()]
    });

    await logToChannel(interaction.guild, {
      title: '👢 User Kicked',
      thumbnail: member.user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: 'User', value: `<@${member.id}> (${member.user.tag})`, inline: true },
        { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Reason', value: reason },
      ],
      color: 'Orange'
    });
  }
};
