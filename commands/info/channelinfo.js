const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

const channelTypeNames = {
  0: 'Text', 2: 'Voice', 4: 'Category', 5: 'Announcement',
  10: 'Announcement Thread', 11: 'Public Thread', 12: 'Private Thread',
  13: 'Stage', 15: 'Forum', 16: 'Media'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('Displays detailed information about a channel')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Channel to inspect').setRequired(false)),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    const embed = new EmbedBuilder()
      .setTitle(`📺 #${channel.name}`)
      .setColor('Blue')
      .addFields(
        { name: '🆔 Channel ID', value: channel.id, inline: true },
        { name: '📂 Type', value: channelTypeNames[channel.type] ?? `Unknown (${channel.type})`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:D> (<t:${Math.floor(channel.createdTimestamp / 1000)}:R>)`, inline: false },
      );

    if (channel.type === 0 || channel.type === 5) {
      embed.addFields(
        { name: '🔞 NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true },
        { name: '⏱️ Slowmode', value: channel.rateLimitPerUser ? `${channel.rateLimitPerUser}s` : 'None', inline: true },
        { name: '📌 Position', value: `${channel.position}`, inline: true },
      );
      if (channel.topic) embed.addFields({ name: '📝 Topic', value: channel.topic, inline: false });
    }

    if (channel.type === 2) {
      embed.addFields(
        { name: '🔊 Bitrate', value: `${channel.bitrate / 1000}kbps`, inline: true },
        { name: '👥 User Limit', value: channel.userLimit ? `${channel.userLimit}` : 'No limit', inline: true },
        { name: '👤 Connected', value: `${channel.members?.size ?? 0}`, inline: true },
      );
    }

    if (channel.parent) embed.addFields({ name: '📁 Category', value: channel.parent.name, inline: true });

    embed.setFooter({ text: `Requested by ${interaction.user.tag}` }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
