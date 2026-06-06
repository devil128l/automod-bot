const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const OWNER_ID = '682981714523586606';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload a command without restarting the bot (Bot Owner only)')
    .addStringOption(opt =>
      opt.setName('command').setDescription('Name of the command to reload').setRequired(true)),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ Not authorized.', ephemeral: true });
    }

    const commandName = interaction.options.getString('command').toLowerCase();
    const command = interaction.client.commands.get(commandName);

    if (!command) {
      return interaction.reply({ content: `❌ No command named \`${commandName}\` found.`, ephemeral: true });
    }

    const commandsPath = path.join(__dirname, '..');
    const folders = fs.readdirSync(commandsPath);
    let commandPath = null;

    for (const folder of folders) {
      const fp = path.join(commandsPath, folder, `${commandName}.js`);
      if (fs.existsSync(fp)) { commandPath = fp; break; }
    }

    if (!commandPath) {
      return interaction.reply({ content: `❌ File for \`${commandName}\` not found on disk.`, ephemeral: true });
    }

    try {
      delete require.cache[require.resolve(commandPath)];
      const newCommand = require(commandPath);
      interaction.client.commands.set(newCommand.data.name, newCommand);

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('♻️ Command Reloaded')
          .setDescription(`**\`/${commandName}\`** has been successfully reloaded.`)
          .setColor('Green').setTimestamp()],
        ephemeral: true
      });
    } catch (err) {
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('❌ Reload Failed')
          .setDescription(`\`\`\`\n${err.message}\n\`\`\``)
          .setColor('Red').setTimestamp()],
        ephemeral: true
      });
    }
  }
};
