const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("View a user's avatar in full size")
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to get avatar of (defaults to yourself)').setRequired(false)),

  async execute(interaction) {
    const user = await (interaction.options.getUser('user') || interaction.user).fetch();
    const member = interaction.guild.members.cache.get(user.id);

    const globalAvatar = user.displayAvatarURL({ dynamic: true, size: 1024 });
    const serverAvatar = member?.avatar ? member.displayAvatarURL({ dynamic: true, size: 1024 }) : null;

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ ${user.tag}'s Avatar`)
      .setImage(globalAvatar)
      .setColor(member?.displayHexColor || 'Random')
      .setFooter({ text: 'Click the buttons to switch between formats' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('PNG').setStyle(ButtonStyle.Link)
        .setURL(user.displayAvatarURL({ extension: 'png', size: 1024 })),
      new ButtonBuilder().setLabel('JPG').setStyle(ButtonStyle.Link)
        .setURL(user.displayAvatarURL({ extension: 'jpg', size: 1024 })),
      new ButtonBuilder().setLabel('WEBP').setStyle(ButtonStyle.Link)
        .setURL(user.displayAvatarURL({ extension: 'webp', size: 1024 })),
    );

    if (user.avatar?.startsWith('a_')) {
      row.addComponents(
        new ButtonBuilder().setLabel('GIF').setStyle(ButtonStyle.Link)
          .setURL(user.displayAvatarURL({ extension: 'gif', size: 1024 }))
      );
    }

    const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    if (serverAvatar && serverAvatar !== globalAvatar) {
      const serverEmbed = new EmbedBuilder()
        .setTitle(`🖼️ ${user.tag}'s Server Avatar`)
        .setImage(serverAvatar)
        .setColor(member?.displayHexColor || 'Random');

      const serverRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Server PNG').setStyle(ButtonStyle.Link)
          .setURL(member.displayAvatarURL({ extension: 'png', size: 1024 })),
        new ButtonBuilder().setLabel('Server WEBP').setStyle(ButtonStyle.Link)
          .setURL(member.displayAvatarURL({ extension: 'webp', size: 1024 })),
      );

      await interaction.followUp({ embeds: [serverEmbed], components: [serverRow] });
    }
  }
};
