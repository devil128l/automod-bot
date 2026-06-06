const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const categoryIcons = {
  admin: '⚙️',
  moderation: '🛡️',
  info: 'ℹ️',
  general: '🌐',
  owner: '👑',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Browse all available bot commands'),

  async execute(interaction, client) {
    const commandsPath = path.join(__dirname, '..');
    const folders = fs.readdirSync(commandsPath).filter(f =>
      fs.lstatSync(path.join(commandsPath, f)).isDirectory()
    );

    const pages = [];

    for (const folder of folders) {
      const folderPath = path.join(commandsPath, folder);
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
      const cmds = [];

      for (const file of files) {
        try {
          const cmd = require(path.join(folderPath, file));
          if (cmd.data?.name) cmds.push({ name: cmd.data.name, description: cmd.data.description || 'No description.' });
        } catch (_) {}
      }

      if (cmds.length === 0) continue;

      const icon = categoryIcons[folder] || '📁';
      pages.push(new EmbedBuilder()
        .setTitle(`${icon} ${folder.charAt(0).toUpperCase() + folder.slice(1)} Commands`)
        .setDescription(cmds.map(c => `> **\`/${c.name}\`**\n> ${c.description}`).join('\n\n'))
        .setColor(0x5865F2)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      );
    }

    if (pages.length === 0) {
      return interaction.reply({ content: '❌ No commands found.', ephemeral: true });
    }

    let page = 0;

    const buildEmbed = (i) =>
      pages[i].setFooter({ text: `Page ${i + 1}/${pages.length} • Use buttons to navigate` });

    const buildRow = (i) => new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('help_first').setEmoji('⏮').setStyle(ButtonStyle.Secondary).setDisabled(i === 0),
      new ButtonBuilder().setCustomId('help_prev').setEmoji('◀').setStyle(ButtonStyle.Primary).setDisabled(i === 0),
      new ButtonBuilder().setCustomId('help_next').setEmoji('▶').setStyle(ButtonStyle.Primary).setDisabled(i === pages.length - 1),
      new ButtonBuilder().setCustomId('help_last').setEmoji('⏭').setStyle(ButtonStyle.Secondary).setDisabled(i === pages.length - 1),
    );

    const msg = await interaction.reply({
      embeds: [buildEmbed(page)],
      components: [buildRow(page)],
      ephemeral: true,
      fetchReply: true
    });

    const collector = msg.createMessageComponentCollector({ time: 300_000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ This menu isn't yours.", ephemeral: true });
      }

      if (i.customId === 'help_first') page = 0;
      else if (i.customId === 'help_prev') page = Math.max(0, page - 1);
      else if (i.customId === 'help_next') page = Math.min(pages.length - 1, page + 1);
      else if (i.customId === 'help_last') page = pages.length - 1;

      await i.update({ embeds: [buildEmbed(page)], components: [buildRow(page)] });
    });

    collector.on('end', () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};
