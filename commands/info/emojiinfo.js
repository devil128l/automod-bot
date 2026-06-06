const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emojiinfo')
    .setDescription('Displays information about a custom emoji')
    .addStringOption(opt =>
      opt.setName('emoji')
        .setDescription('Paste the custom emoji (e.g. <:name:id> or <a:name:id>)')
        .setRequired(true)),

  async execute(interaction) {
    const input = interaction.options.getString('emoji');
    const match = input.match(/<(a)?:(\w+):(\d+)>/);

    if (!match) {
      return interaction.reply({ content: '❌ Invalid emoji format. Use a custom server emoji like `<:name:id>`.', ephemeral: true });
    }

    const [, animated, name, id] = match;
    const ext = animated ? 'gif' : 'png';
    const url = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=256`;

    const emoji = interaction.client.emojis.cache.get(id);

    const embed = new EmbedBuilder()
      .setTitle(`🧩 Emoji: :${name}:`)
      .setThumbnail(url)
      .setColor('Yellow')
      .addFields(
        { name: '🆔 ID', value: id, inline: true },
        { name: '📛 Name', value: name, inline: true },
        { name: '🎞️ Animated', value: animated ? 'Yes' : 'No', inline: true },
      );

    if (emoji) {
      embed.addFields(
        { name: '📅 Created', value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '🌐 Server', value: emoji.guild?.name ?? 'Unknown', inline: true },
      );
    }

    embed.addFields({ name: '🔗 URL', value: `[Open Image](${url})`, inline: false });

    await interaction.reply({ embeds: [embed] });
  }
};
