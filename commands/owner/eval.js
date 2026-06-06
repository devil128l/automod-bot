const { SlashCommandBuilder, EmbedBuilder, codeBlock } = require('discord.js');
const { inspect } = require('util');

const OWNER_ID = '682981714523586606';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate JavaScript code (Bot Owner only)')
    .addStringOption(opt =>
      opt.setName('code').setDescription('Code to execute').setRequired(true))
    .addBooleanOption(opt =>
      opt.setName('async').setDescription('Wrap in async function').setRequired(false)),

  async execute(interaction, client) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ Not authorized.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    let code = interaction.options.getString('code');
    const isAsync = interaction.options.getBoolean('async') ?? false;

    if (isAsync) code = `(async () => { ${code} })()`;

    const start = Date.now();
    let output, type, success;

    try {
      let evaled = eval(code);
      if (evaled instanceof Promise) evaled = await evaled;
      output = typeof evaled === 'string' ? evaled : inspect(evaled, { depth: 2 });
      type = typeof evaled;
      success = true;
    } catch (err) {
      output = err.stack || err.message;
      type = 'Error';
      success = false;
    }

    const elapsed = Date.now() - start;

    if (output.length > 1900) output = output.slice(0, 1900) + '\n...truncated';

    const embed = new EmbedBuilder()
      .setTitle(success ? '✅ Eval Success' : '❌ Eval Error')
      .setColor(success ? 'Green' : 'Red')
      .addFields(
        { name: '📥 Input', value: codeBlock('js', code.slice(0, 1000)), inline: false },
        { name: `📤 Output (${type})`, value: codeBlock('js', output), inline: false },
        { name: '⏱️ Executed In', value: `${elapsed}ms`, inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
