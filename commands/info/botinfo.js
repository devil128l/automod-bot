const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os');
const packageJson = require('../../package.json');

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}d ${h}h ${m}m ${sec}s`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Shows detailed information about the bot'),

  async execute(interaction, client) {
    await interaction.deferReply();

    const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const memTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

    const embed = new EmbedBuilder()
      .setTitle('🤖 Bot Information')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setColor(0x5865F2)
      .addFields(
        { name: '🏷️ Name', value: client.user.username, inline: true },
        { name: '🏓 Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: '⏱️ Uptime', value: formatUptime(client.uptime), inline: true },
        { name: '🌐 Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Total Users', value: `${totalUsers.toLocaleString()}`, inline: true },
        { name: '📡 Commands', value: `${client.commands.size}`, inline: true },
        { name: '🟢 Node.js', value: `${process.version}`, inline: true },
        { name: '📦 Discord.js', value: `v${djsVersion}`, inline: true },
        { name: '💾 RAM Usage', value: `${memUsed} MB / ${memTotal} GB`, inline: true },
        { name: '🖥️ Platform', value: `${os.platform()} (${os.arch()})`, inline: true },
        { name: '🔖 Bot Version', value: `v${packageJson.version}`, inline: true },
        { name: '👤 Author', value: packageJson.author || 'Unknown', inline: true },
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
