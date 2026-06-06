const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a member')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a role to a member')
        .addUserOption(opt => opt.setName('user').setDescription('Target member').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Role to add').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a role from a member')
        .addUserOption(opt => opt.setName('user').setDescription('Target member').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member) return interaction.reply({ content: '❌ User not found.', ephemeral: true });

    const botMember = interaction.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return interaction.reply({ content: '❌ I cannot manage a role higher than or equal to my highest role.', ephemeral: true });
    }
    if (role.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: '❌ You cannot manage a role higher than or equal to your highest role.', ephemeral: true });
    }

    try {
      if (sub === 'add') {
        if (member.roles.cache.has(role.id)) {
          return interaction.reply({ content: `❌ ${member.user.tag} already has that role.`, ephemeral: true });
        }
        await member.roles.add(role, reason);
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle('✅ Role Added')
            .addFields(
              { name: 'User', value: `${member.user.tag}`, inline: true },
              { name: 'Role', value: `${role}`, inline: true },
              { name: 'Reason', value: reason },
            )
            .setColor('Green').setTimestamp()]
        });
      } else {
        if (!member.roles.cache.has(role.id)) {
          return interaction.reply({ content: `❌ ${member.user.tag} doesn't have that role.`, ephemeral: true });
        }
        await member.roles.remove(role, reason);
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle('✅ Role Removed')
            .addFields(
              { name: 'User', value: `${member.user.tag}`, inline: true },
              { name: 'Role', value: `${role}`, inline: true },
              { name: 'Reason', value: reason },
            )
            .setColor('Orange').setTimestamp()]
        });
      }

      await logToChannel(interaction.guild, {
        title: sub === 'add' ? '✅ Role Added' : '✅ Role Removed',
        fields: [
          { name: 'User', value: `<@${member.id}>`, inline: true },
          { name: 'Role', value: `<@&${role.id}>`, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Reason', value: reason },
        ],
        color: sub === 'add' ? 'Green' : 'Orange'
      });
    } catch (err) {
      await interaction.reply({ content: `❌ Failed: ${err.message}`, ephemeral: true });
    }
  }
};
