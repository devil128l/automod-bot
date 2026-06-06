const { EmbedBuilder } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.partial || message.author?.bot) return;

    let settings;
    try {
      settings = await GuildSettings.findOne({ guildId: message.guild.id });
    } catch (_) { return; }

    if (!settings?.logChannelId) return;
    const logChannel = message.guild.channels.cache.get(settings.logChannelId);
    if (!logChannel) return;

    const content = message.content || '*[No text content]*';
    const truncated = content.length > 1024 ? content.slice(0, 1021) + '...' : content;

    const logEmbed = new EmbedBuilder()
      .setTitle('🗑️ Message Deleted')
      .setColor('Red')
      .addFields(
        { name: '👤 Author', value: `<@${message.author.id}> (${message.author.tag})`, inline: true },
        { name: '📺 Channel', value: `<#${message.channel.id}>`, inline: true },
        { name: '📝 Content', value: truncated },
      )
      .setTimestamp();

    if (message.attachments.size > 0) {
      logEmbed.addFields({
        name: '📎 Attachments',
        value: message.attachments.map(a => `[${a.name}](${a.proxyURL})`).join('\n')
      });
    }

    if (settings.antiGhostPing) {
      const mentionedUsers = message.mentions.users.filter(u => !u.bot);
      if (mentionedUsers.size > 0) {
        const ghostEmbed = new EmbedBuilder()
          .setTitle('👻 Ghost Ping Detected!')
          .setColor('DarkOrange')
          .addFields(
            { name: '🕵️ Pinger', value: `<@${message.author.id}> (${message.author.tag})`, inline: true },
            { name: '📺 Channel', value: `<#${message.channel.id}>`, inline: true },
            { name: '🎯 Pinged', value: mentionedUsers.map(u => `<@${u.id}>`).join(', '), inline: false },
          )
          .setTimestamp();

        await logChannel.send({ embeds: [ghostEmbed] }).catch(() => {});

        await message.channel.send({
          content: `👻 **Ghost ping detected!** <@${message.author.id}> pinged ${mentionedUsers.map(u => `<@${u.id}>`).join(', ')} and deleted the message.`
        }).catch(() => {});
      }
    }

    await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
  }
};
