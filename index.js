const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, // Required to fetch all members
    GatewayIntentBits.DirectMessages,
  ],
});

const TOKEN = 'TOKEN_HERE'; // Replace with your bot's token

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  if (message.content.startsWith('!dmrole')) {
    const mentionedRoles = message.mentions.roles; // Get mentioned roles
    if (mentionedRoles.size === 0) {
      message.reply("Please mention at least one role.");
      return;
    }

    const alreadySent = new Set(); // Track users who have been DM'd

    for (const [roleId, role] of mentionedRoles) {
      const roleMembers = await role.guild.members.fetch(); // Fetch all members in the guild

      const membersWithRole = roleMembers.filter((member) => 
        member.roles.cache.has(roleId) && !member.user.bot
      ); // Filter for those with the role and are not bots

      if (membersWithRole.size === 0) {
        message.reply(`No members found with the role: ${role.name}`);
        continue;
      }

      // Send DMs to all members with the mentioned role
      for (const [memberId, member] of membersWithRole) {
        if (!alreadySent.has(memberId)) {
          try {
            await member.send('MSG_HERE');
            console.log(`DM sent to user: ${member.user.tag}`); // Log successful DM
            alreadySent.add(memberId); // Mark as already DM'd
          } catch (err) {
            console.error(`Couldn't send DM to ${member.user.tag}. Error: ${err.message}`);
          }
        }
      }
    }

    message.reply(`DMs sent to ${alreadySent.size} unique users with the role(s): ${mentionedRoles.map((r) => r.name).join(', ')}.`);
  }
});

client.login(TOKEN);

