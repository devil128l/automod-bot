const { EmbedBuilder } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    let settings;
    try {
      settings = await GuildSettings.findOne({ guildId: newMessage.guild.id });
    } catch (_) { return; }

    if (!settings?.logChannelId) return;
    const logChannel = newMessage.guild.channels.cache.get(settings.logChannelId);
    if (!logChannel) return;

    const oldContent = oldMessage.content || '*[No content]*';
    const newContent = newMessage.content || '*[No content]*';

    const trim = (str) => str.length > 1024 ? str.slice(0, 1021) + '...' : str;

    const embed = new EmbedBuilder()
      .setTitle('✏️ Message Edited')
      .setColor('Orange')
      .setURL(newMessage.url)
      .addFields(
        { name: '👤 Author', value: `<@${newMessage.author.id}> (${newMessage.author.tag})`, inline: true },
        { name: '📺 Channel', value: `<#${newMessage.channel.id}>`, inline: true },
        { name: '🔗 Jump', value: `[View Message](${newMessage.url})`, inline: true },
        { name: '📝 Before', value: trim(oldContent) },
        { name: '📝 After', value: trim(newContent) },
      )
      .setTimestamp();

    await logChannel.send({ embeds: [embed] }).catch(() => {});
  }
};
