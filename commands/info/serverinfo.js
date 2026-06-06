const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Very High'];
const boostTiers = { 0: 'No Tier', 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Displays detailed information about this server'),

  async execute(interaction) {
    await interaction.deferReply();
    const { guild } = interaction;
    await guild.fetch();

    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const categories = guild.channels.cache.filter(c => c.type === 4).size;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = guild.memberCount - bots;

    const embed = new EmbedBuilder()
      .setTitle(`🌐 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .setColor('Blue')
      .addFields(
        { name: '🆔 Server ID', value: guild.id, inline: true },
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D> (<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)`, inline: false },
        { name: '👥 Members', value: `${guild.memberCount} total (${humans} humans · ${bots} bots)`, inline: true },
        { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '😀 Emojis', value: `${guild.emojis.cache.size} emojis · ${guild.stickers.cache.size} stickers`, inline: true },
        { name: '💬 Channels', value: `📝 ${textChannels} text · 🔊 ${voiceChannels} voice · 📂 ${categories} categories`, inline: false },
        { name: '🚀 Boost', value: `${boostTiers[guild.premiumTier] || 'No Tier'} (${guild.premiumSubscriptionCount} boosts)`, inline: true },
        { name: '🔒 Verification', value: verificationLevels[guild.verificationLevel] || 'Unknown', inline: true },
        { name: '🌍 Locale', value: guild.preferredLocale, inline: true },
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    if (guild.bannerURL()) embed.setImage(guild.bannerURL({ size: 1024 }));

    await interaction.editReply({ embeds: [embed] });
  }
};
