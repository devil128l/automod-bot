
# 🤖 Automod Bot v2

A powerful, advanced Discord moderation bot built with **Discord.js v14**, **MongoDB/Mongoose**, featuring slash commands, automod, comprehensive logging, and per-server configuration.

![Automod Banner](https://dcflipybird.netlify.app/botbanner.png)

---

[**➕ Invite the Bot**](https://discord.com/oauth2/authorize?client_id=1363943273374154842&permissions=8&scope=bot%20applications.commands) · [**💬 Support Server**](https://discord.gg/QukxRRFhzQ)
 ## support server 
 <p align="center">
  <a href="https://discord.gg/3c24dYbK83">
    <img src="https://cwkhan.is-a.dev/api/widget/svg?id=787315610102530048&n=%3C%2FCw+khan%3E&t=discord&m=562&o=30&b=https%3A%2F%2Fi.ibb.co%2F0phjK8NK%2Fb1b1f8f1a11b.png&ic=https%3A%2F%2Fi.ibb.co%2Fxq7kkNZg%2F0e7e946da3d8.jpg&inv=3c24dYbK83&d=Join+cwkhan+server+now&lp=center" alt="Cw Khan Discord Server" />
  </a>
</p>
---

## ✨ Features

- **Advanced Automod** — Anti-link, anti-spam (configurable thresholds), anti-ghost ping
- **Auto-Actions** — Automatically timeout, kick, or ban users when they hit a warn threshold
- **Slash Commands** — All commands use modern Discord slash command system
- **Paginated Help** — Interactive button-based help menu with categories
- **Comprehensive Logging** — Message edits, deletes, mod actions all logged to a configurable channel
- **Per-Server Config** — All settings saved per-guild in MongoDB
- **DM Notifications** — Users are DMed when muted, kicked, banned, or warned
- **Channel Control** — Lockdown and slowmode commands
- **Role Management** — Add/remove roles from members directly via commands
- **Ghost Ping Detection** — Detects and reports deleted mention messages

---

## 🛠️ Setup

### Prerequisites

- Node.js v18+
- MongoDB URI (local or Atlas cloud)
- Discord Bot Token
- Discord Application Client ID

### Installation

```bash
git clone https://github.com/Khanmanan/automod-bot.git
cd automod-bot
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DISCORD_TOKEN=your_discord_bot_token
MONGO_URI=your_mongodb_connection_string
CLIENT_ID=your_bot_application_client_id
PORT=3000
```

### Deploy Slash Commands

```bash
npm run deploy
```

### Start the Bot

```bash
npm start
```

---

## 📂 Project Structure

```
automod-bot/
├── commands/
│   ├── admin/          # Server admin tools
│   ├── general/        # General-purpose commands
│   ├── info/           # Info & stats commands
│   ├── moderation/     # Moderation commands
│   └── owner/          # Bot owner-only commands
├── events/             # Discord event handlers
├── models/             # Mongoose schemas
├── utils/              # Shared utilities
├── deploy-commands.js  # Slash command deployer
└── index.js            # Bot entry point
```

---

## 🧩 Commands

### ⚙️ Admin

| Command | Description |
|---|---|
| `/setlog set \|clear\|view` | Configure the moderation log channel |
| `/status` | View all automod settings for the server |
| `/automod toggle` | Enable or disable the automod system |
| `/automod warnaction` | Set automatic action on warn threshold (timeout/kick/ban) |
| `/antilink` | Toggle anti-link protection |
| `/antispam toggle` | Toggle anti-spam protection |
| `/antispam config` | Configure spam threshold and time window |
| `/slowmode` | Set or remove slowmode in a channel |
| `/lockdown lock\|unlock` | Lock or unlock a channel for @everyone |

### 🛡️ Moderation

| Command | Description |
|---|---|
| `/ban` | Ban a member (with DM, delete days, silent option) |
| `/kick` | Kick a member (with DM, silent option) |
| `/mute` | Timeout a member with a custom duration |
| `/unmute` | Remove timeout from a member |
| `/timeout` | Timeout a member for a precise duration |
| `/softban` | Ban + instantly unban to clear messages |
| `/warn` | Warn a user (triggers auto-action at threshold) |
| `/warnings` | View a user's warning history with IDs |
| `/clearwarns all` | Clear all warnings for a user |
| `/clearwarns one` | Remove a specific warning by ID |
| `/clear` | Bulk delete messages (with user/text filter) |
| `/unban` | Unban a user by their ID |
| `/role add\|remove` | Add or remove a role from a member |
| `/nick` | Change or reset a member's nickname |

### ℹ️ Info

| Command | Description |
|---|---|
| `/serverinfo` | Detailed server statistics and info |
| `/userinfo` | Detailed user profile including roles and timeout status |
| `/botinfo` | Bot stats — ping, uptime, memory, Discord.js version |
| `/channelinfo` | Detailed channel information |
| `/roleinfo` | Role details including permissions and member count |
| `/emojiinfo` | Info about a custom emoji |
| `/ping` | WebSocket and roundtrip latency |
| `/uptime` | Bot uptime and start time |

### 🌐 General

| Command | Description |
|---|---|
| `/help` | Paginated command menu by category |
| `/avatar` | View a user's avatar with download format links |

### 👑 Owner

| Command | Description |
|---|---|
| `/botstatus` | Change the bot's activity and status |
| `/eval` | Evaluate JavaScript code |
| `/guilds` | List all servers the bot is in |
| `/reload` | Hot-reload a command without restarting |

---

## ⚙️ Automod Configuration

1. Enable automod: `/automod toggle`
2. Set a log channel: `/setlog set #mod-logs`
3. Enable features: `/antilink`, `/antispam toggle`
4. Configure spam threshold: `/antispam config messages:5 interval:5`
5. Set warn auto-actions: `/automod warnaction action:timeout threshold:3 duration:60`

---

## 📜 License

MIT © 2026 Khanmanan

---

## 👤 Author

**Khanmanan** · [GitHub](https://github.com/Khanmanan) · [Bot Repo](https://github.com/Khanmanan/automod-bot)

"I don’t update this project anymore — it’s now maintained by AI."
