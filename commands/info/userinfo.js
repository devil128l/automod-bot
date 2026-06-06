const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Shows detailed information about a user')
    .addUserOption(opt =>
      opt.setName('target').setDescription('User to inspect (defaults to yourself)').setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();

    const user = await (interaction.options.getUser('target') || interaction.user).fetch();
    const member = interaction.guild.members.cache.get(user.id);

    const roles = member
      ? member.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position)
      : null;

    const roleList = roles?.size
      ? roles.map(r => `<@&${r.id}>`).slice(0, 10).join(' ') + (roles.size > 10 ? ` (+${roles.size - 10} more)` : '')
      : 'No roles';

    const statusMap = { online: '🟢 Online', idle: '🌙 Idle', dnd: '🔴 Do Not Disturb', offline: '⚫ Offline' };

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setColor(member?.displayHexColor || 'Orange')
      .addFields(
        { name: '🆔 User ID', value: user.id, inline: true },
        { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`, inline: false },
      );

    if (member) {
      embed.addFields(
        { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D> (<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)`, inline: false },
        { name: '🎭 Highest Role', value: `${member.roles.highest}`, inline: true },
        { name: '⏱️ Timed Out', value: member.isCommunicationDisabled() ? `Until <t:${Math.floor(member.communicationDisabledUntilTimestamp / 1000)}:R>` : 'No', inline: true },
        { name: `🏷️ Roles (${roles?.size ?? 0})`, value: roleList, inline: false },
      );
    }

    if (user.banner) {
      embed.setImage(user.bannerURL({ dynamic: true, size: 1024 }));
    }

    embed.setFooter({ text: `Requested by ${interaction.user.tag}` }).setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
