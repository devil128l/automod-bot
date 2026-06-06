const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Displays information about a role')
    .addRoleOption(opt =>
      opt.setName('role').setDescription('Role to inspect').setRequired(true)),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    const keyPerms = [
      ['Administrator', PermissionFlagsBits.Administrator],
      ['Manage Server', PermissionFlagsBits.ManageGuild],
      ['Manage Roles', PermissionFlagsBits.ManageRoles],
      ['Manage Channels', PermissionFlagsBits.ManageChannels],
      ['Kick Members', PermissionFlagsBits.KickMembers],
      ['Ban Members', PermissionFlagsBits.BanMembers],
      ['Moderate Members', PermissionFlagsBits.ModerateMembers],
      ['Manage Messages', PermissionFlagsBits.ManageMessages],
      ['Mention Everyone', PermissionFlagsBits.MentionEveryone],
    ].filter(([, flag]) => role.permissions.has(flag)).map(([name]) => name);

    const members = interaction.guild.members.cache.filter(m => m.roles.cache.has(role.id));

    const embed = new EmbedBuilder()
      .setTitle(`🏷️ Role: ${role.name}`)
      .setColor(role.color || 0x99AAB5)
      .addFields(
        { name: '🆔 Role ID', value: role.id, inline: true },
        { name: '🎨 Color', value: role.hexColor, inline: true },
        { name: '📌 Position', value: `${role.position}`, inline: true },
        { name: '👥 Members', value: `${members.size}`, inline: true },
        { name: '📢 Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: '📌 Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: '🤖 Managed', value: role.managed ? 'Yes (Bot/Integration)' : 'No', inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '🔑 Key Permissions', value: keyPerms.length ? keyPerms.join(', ') : 'None', inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
