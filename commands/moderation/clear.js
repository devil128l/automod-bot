const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logToChannel = require('../../utils/logToChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Bulk delete messages from this channel')
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Number of messages to delete (1–100)')
        .setMinValue(1).setMaxValue(100).setRequired(true))
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Only delete messages from this user')
        .setRequired(false))
    .addStringOption(opt =>
      opt.setName('contains')
        .setDescription('Only delete messages that contain this text')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const amount = interaction.options.getInteger('amount');
    const filterUser = interaction.options.getUser('user');
    const contains = interaction.options.getString('contains')?.toLowerCase();

    let messages = await interaction.channel.messages.fetch({ limit: 100 });

    if (filterUser) messages = messages.filter(m => m.author.id === filterUser.id);
    if (contains) messages = messages.filter(m => m.content.toLowerCase().includes(contains));

    messages = messages.first(amount);

    if (messages.length === 0) {
      return interaction.editReply({ content: '❌ No messages matched your filters.' });
    }

    const deleted = await interaction.channel.bulkDelete(messages, true);

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('🧹 Messages Cleared')
        .addFields(
          { name: 'Deleted', value: `${deleted.size} message(s)`, inline: true },
          { name: 'Channel', value: `${interaction.channel}`, inline: true },
          { name: 'Filter', value: filterUser ? `From ${filterUser.tag}` : contains ? `Contains "${contains}"` : 'None', inline: true },
        )
        .setColor('Blue').setTimestamp()]
    });

    await logToChannel(interaction.guild, {
      title: '🧹 Messages Bulk Deleted',
      fields: [
        { name: 'Amount', value: `${deleted.size}`, inline: true },
        { name: 'Channel', value: `<#${interaction.channel.id}>`, inline: true },
        { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Filter', value: filterUser ? `From ${filterUser.tag}` : contains ? `Contains "${contains}"` : 'None', inline: true },
      ],
      color: 'Blue'
    });
  }
};
