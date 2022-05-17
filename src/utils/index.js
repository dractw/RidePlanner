const moment = require('moment')
const marked = require('marked')
const { levels_cb } = require('../const')

const get_bot_name = () => {
  const { NODE_ENV } = process.env

  switch (NODE_ENV) {
    case 'production':
      return '@ride_planner_bot'
    case 'dev':
      return '@ride_planner_dev_bot'
    default:
      return '@ride_planner_bot'
  }
}

const get_ride_markdown = (ride, author, external_message) => {
  const { title, date, start_point, level, participants, description, _id } = ride
  const show_name = author.name ? `${name.replace('undefined', `${author.username || ''}`).trim()}` : author.username

  const markdown_obj = {
    title: `**${title.toString().toUpperCase()}** (\`${_id}\`)`,
    date: `Начало: ${moment(date).locale('ru').format('DD.MM.YYYY, hh:mm')} `,
    start: `Место сбора: \`${start_point}\` `,
    level: `Сложность: ${levels_cb[level]}`,
    participants: `Кол-во участников: ${participants.length} `,
    description: `Инфо: _${description}_`,
    author: `Орг: [${show_name}](tg://user?id=${author.user_id})`,
  }

  return marked.parseInline(Object.keys(markdown_obj).reduce((acc, next) => acc + markdown_obj[next] + '\n', external_message ? `${external_message}\n\n` : ''))
}

const default_bot_reply = async (ctx) => await ctx.reply(`${get_bot_name()} - бот для отслеживания запланированых прохватов и событий\nНапиши ему в личные сообщения, он тебе всё расскажет ;)`)
  .catch((e) => console.error('Something  bad happens:', e))

module.exports = {
  get_bot_name,
  get_ride_markdown,
  default_bot_reply,
}
