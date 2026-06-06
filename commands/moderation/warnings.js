const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Warn = require('../../models/Warn');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription("View a user's warning history")
    .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const data = await Warn.findOne({ userId: user.id, guildId: interaction.guild.id });

    const embed = new EmbedBuilder()
      .setTitle(`📋 Warnings — ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor('Yellow')
      .setFooter({ text: `User ID: ${user.id}` })
      .setTimestamp();

    if (!data || data.warnings.length === 0) {
      embed.setDescription('✅ This user has no warnings.');
    } else {
      embed.setDescription(`**Total warnings:** ${data.warnings.length}`);
      data.warnings.slice(-10).forEach((warn, i) => {
        const id = warn.warnId ? `\`${warn.warnId}\`` : `#${i + 1}`;
        embed.addFields({
          name: `⚠️ Warning ${id}`,
          value: `**Reason:** ${warn.reason}\n**Moderator:** <@${warn.modId}>\n**Date:** <t:${Math.floor(new Date(warn.date).getTime() / 1000)}:R>`
        });
      });
      if (data.warnings.length > 10) {
        embed.addFields({ name: '...', value: `${data.warnings.length - 10} older warnings not shown.` });
      }
    }

    await interaction.reply({ embeds: [embed] });
  }
};
