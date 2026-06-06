const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const OWNER_ID = '682981714523586606';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guilds')
    .setDescription('Lists all servers the bot is in (Bot Owner only)'),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ Not authorized.', ephemeral: true });
    }

    const guilds = interaction.client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount);
    const totalUsers = guilds.reduce((acc, g) => acc + g.memberCount, 0);

    const pages = [];
    const chunkSize = 10;
    const guildArr = [...guilds.values()];

    for (let i = 0; i < guildArr.length; i += chunkSize) {
      const chunk = guildArr.slice(i, i + chunkSize);
      pages.push(chunk.map((g, idx) =>
        `**${i + idx + 1}.** ${g.name}\n> ID: \`${g.id}\` · Members: **${g.memberCount}**`
      ).join('\n\n'));
    }

    const embed = new EmbedBuilder()
      .setTitle(`🌐 Bot Guilds (${guilds.size} total)`)
      .setDescription(pages[0] || 'No guilds.')
      .addFields({ name: '👥 Total Users', value: `${totalUsers.toLocaleString()}`, inline: true })
      .setColor(0x5865F2)
      .setFooter({ text: pages.length > 1 ? `Page 1/${pages.length} — Showing top 10 by member count` : `Showing all ${guilds.size} servers` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
