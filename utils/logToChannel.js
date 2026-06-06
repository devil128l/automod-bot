const { EmbedBuilder } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');

module.exports = async function logToChannel(guild, embedData) {
  try {
    const settings = await GuildSettings.findOne({ guildId: guild.id });
    if (!settings?.logChannelId) return;

    const logChannel = guild.channels.cache.get(settings.logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle(embedData.title || 'Log Entry')
      .setColor(embedData.color || 'Blue')
      .setTimestamp();

    if (embedData.description) embed.setDescription(embedData.description);
    if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);
    if (embedData.fields?.length) embed.addFields(...embedData.fields);
    if (embedData.footer) embed.setFooter(embedData.footer);

    await logChannel.send({ embeds: [embed] });
  } catch (err) {
    console.error('[logToChannel] Failed to send log:', err.message);
  }
};
