const { SlashCommandBuilder, ActivityType, EmbedBuilder } = require('discord.js');

const OWNER_ID = '682981714523586606';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botstatus')
    .setDescription("Update the bot's presence (Bot Owner only)")
    .addStringOption(opt =>
      opt.setName('activity')
        .setDescription('Activity text')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Activity type')
        .setRequired(true)
        .addChoices(
          { name: 'Playing', value: 'Playing' },
          { name: 'Watching', value: 'Watching' },
          { name: 'Listening', value: 'Listening' },
          { name: 'Competing', value: 'Competing' },
        ))
    .addStringOption(opt =>
      opt.setName('status')
        .setDescription('Bot status')
        .setRequired(false)
        .addChoices(
          { name: 'Online', value: 'online' },
          { name: 'Idle', value: 'idle' },
          { name: 'Do Not Disturb', value: 'dnd' },
          { name: 'Invisible', value: 'invisible' },
        )),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ This command is restricted to the bot owner.', ephemeral: true });
    }

    const activity = interaction.options.getString('activity');
    const type = interaction.options.getString('type');
    const status = interaction.options.getString('status') || 'online';

    const typeMap = {
      Playing: ActivityType.Playing,
      Watching: ActivityType.Watching,
      Listening: ActivityType.Listening,
      Competing: ActivityType.Competing,
    };

    interaction.client.user.setPresence({
      activities: [{ name: activity, type: typeMap[type] }],
      status
    });

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setTitle('✅ Presence Updated')
        .addFields(
          { name: 'Activity', value: `${type} **${activity}**`, inline: true },
          { name: 'Status', value: status, inline: true },
        )
        .setColor('Green').setTimestamp()],
      ephemeral: true
    });
  }
};
