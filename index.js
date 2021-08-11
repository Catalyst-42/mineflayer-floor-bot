const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node gps.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'gps',
  password: process.argv[5]
})

let step = 0
let sway = 1
let global = 0
let stop = false
let coming = false
// 1792

bot.loadPlugin(pathfinder)
bot.once('spawn', () => {
  const mcData = require('minecraft-data')(bot.version)
  const defaultMove = new Movements(bot, mcData)
	bot.pathfinder.setMovements(defaultMove)

  bot.on('chat', (username, message) => {
	const args = message.split(' ')
	switch(args[0]) {
		case 'come':	
      coming = true
			const target = bot.players[username]?.entity
			if (!target) {
        bot.chat("can't see you")
        return }
			const { x: playerX, y: playerY, z: playerZ } = target.position
			bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, 1))
			return
		case 'start':
      global = 0
      part()
      return
    case 'stop':
      stop = true
    case 'clear':
      step = 0
      global = 0
      sway = 1
      break
    case 'uuid':
      bot.chat(bot.player.uuid)
      break
		}
  })
})

async function part() {
  if (stop) {
    stop = false
    return
  }
  let obsidian = bot.inventory.items().find((item) => (item.name === 'obsidian'))
  await bot.equip(obsidian, 'hand') 
  
  step += 1
  if (step === 16) {
    step = 0

    if (sway === 1) sway = -1
    else sway = 1

    if (bot.blockAt(bot.entity.position.offset(1, -1, 0))['name'] !== 'bedrock' &&
    bot.blockAt(bot.entity.position.offset(1, -1, 0))['name'] !== 'obsidian') {
      await bot.placeBlock(bot.blockAt(bot.entity.position.offset(1, -1, 0)), new Vec3(0, 1, 0), () => {
        global +=1 
        bot.pathfinder.setGoal(new GoalNear(bot.entity.position.x+1, bot.entity.position.y, bot.entity.position.z, 0), 0)
      })
    } else bot.pathfinder.setGoal(new GoalNear(bot.entity.position.x+1, bot.entity.position.y, bot.entity.position.z, 0), 0)

  } else {
    if (bot.blockAt(bot.entity.position.offset(0, -1, sway))['name'] !== 'bedrock' &&
    bot.blockAt(bot.entity.position.offset(0, -1, sway))['name'] !== 'obsidian') {
      await bot.placeBlock(bot.blockAt(bot.entity.position.offset(0, -1, sway)), new Vec3(0, 1, 0), () => {
        global +=1 
        bot.pathfinder.setGoal(new GoalNear(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z+sway, 0), 0)
      })
    } else bot.pathfinder.setGoal(new GoalNear(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z+sway, 0), 0)
  }

  if (global === 1792) {
    bot.chat('inventory is empty')
    return
  }
}

bot.on('goal_reached', () => {
  if (!coming) part()
  if (coming) coming = false
})

// Unix
// $
// bin
// faith
// IC8 - optifine
// ._. - girl
// Any
// c 
// Zionite
// Unaware
// Architector
// Jirov
// 0x2d 2 | 4 | 9
