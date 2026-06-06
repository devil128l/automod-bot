const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Change or reset a member\'s nickname')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Member to rename').setRequired(true))
    .addStringOption(opt =>
      opt.setName('nickname')
        .setDescription('New nickname (leave empty to reset)')
        .setMaxLength(32)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const nickname = interaction.options.getString('nickname') ?? null;

    if (!member) return interaction.reply({ content: '❌ User not found.', ephemeral: true });
    if (!member.manageable) return interaction.reply({ content: '❌ I cannot change this user\'s nickname.', ephemeral: true });

    const oldNick = member.displayName;

    try {
      await member.setNickname(nickname, `Changed by ${interaction.user.tag}`);

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('✏️ Nickname Updated')
          .addFields(
            { name: 'User', value: `${member.user.tag}`, inline: true },
            { name: 'Before', value: oldNick, inline: true },
            { name: 'After', value: nickname ?? '*Reset*', inline: true },
          )
          .setColor('Blue').setTimestamp()]
      });

      await logToChannel(interaction.guild, {
        title: '✏️ Nickname Changed',
        fields: [
          { name: 'User', value: `<@${member.id}>`, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Before', value: oldNick, inline: true },
          { name: 'After', value: nickname ?? '*Reset*', inline: true },
        ],
        color: 'Blue'
      });
    } catch (err) {
      await interaction.reply({ content: `❌ Failed: ${err.message}`, ephemeral: true });
    }
  }
};
