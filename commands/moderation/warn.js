const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Warn = require('../../models/Warn');
const GuildSettings = require('../../models/GuildSettings');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a user')
    .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the warning').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    await interaction.deferReply();

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const guildId = interaction.guild.id;

    if (user.id === interaction.user.id) return interaction.editReply({ content: '❌ You cannot warn yourself.' });
    if (user.bot) return interaction.editReply({ content: '❌ You cannot warn a bot.' });

    let warningData = await Warn.findOne({ userId: user.id, guildId });
    if (!warningData) warningData = new Warn({ userId: user.id, guildId, warnings: [] });

    warningData.warnings.push({ modId: interaction.user.id, reason, date: new Date() });
    await warningData.save();

    const count = warningData.warnings.length;

    try {
      await user.send({
        embeds: [new EmbedBuilder()
          .setTitle(`⚠️ You were warned in ${interaction.guild.name}`)
          .setDescription(`**Reason:** ${reason}\n**Total warnings:** ${count}`)
          .setColor('Orange').setTimestamp()]
      });
    } catch (_) {}

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('⚠️ Member Warned')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason },
          { name: 'Total Warnings', value: `${count}`, inline: true },
        )
        .setColor('Orange').setTimestamp()]
    });

    await logToChannel(interaction.guild, {
      title: '⚠️ User Warned',
      thumbnail: user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
        { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Reason', value: reason },
        { name: 'Total Warnings', value: `${count}`, inline: true },
      ],
      color: 'Orange'
    });

    const settings = await GuildSettings.findOne({ guildId });
    if (!settings || settings.warnAction === 'none') return;
    if (count < settings.warnThreshold) return;

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return;

    try {
      if (settings.warnAction === 'timeout') {
        await member.timeout(settings.warnActionDuration, `Auto-action: reached ${count} warnings`);
        await interaction.followUp({
          embeds: [new EmbedBuilder()
            .setTitle('🤖 Auto-Action Triggered')
            .setDescription(`<@${user.id}> reached **${count} warnings** — automatically timed out for ${Math.round(settings.warnActionDuration / 60000)} minutes.`)
            .setColor('Red').setTimestamp()]
        });
      } else if (settings.warnAction === 'kick') {
        await member.kick(`Auto-action: reached ${count} warnings`);
        await interaction.followUp({
          embeds: [new EmbedBuilder()
            .setTitle('🤖 Auto-Action Triggered')
            .setDescription(`<@${user.id}> reached **${count} warnings** — automatically kicked.`)
            .setColor('Red').setTimestamp()]
        });
      } else if (settings.warnAction === 'ban') {
        await member.ban({ reason: `Auto-action: reached ${count} warnings` });
        await interaction.followUp({
          embeds: [new EmbedBuilder()
            .setTitle('🤖 Auto-Action Triggered')
            .setDescription(`<@${user.id}> reached **${count} warnings** — automatically banned.`)
            .setColor('Red').setTimestamp()]
        });
      }
    } catch (err) {
      console.error('[warn] Auto-action failed:', err.message);
    }
  }
};
