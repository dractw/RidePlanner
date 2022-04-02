const { create_db_connection } = require('./src/db')
const { bot } = require('./src/bot')

create_db_connection()
bot.launch()
