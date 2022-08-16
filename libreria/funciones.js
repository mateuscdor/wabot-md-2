const chalk = require('chalk');
const cfonts = require('cfonts');
const moment = require("moment-timezone");

const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

const banner = cfonts.render(('WHATSAPP|MD|BOT'), {font:'simple',color:'candy',align:'center',gradient:["red","blue"]});

const mytime = moment(Date.now()).tz('America/Lima').locale('pe').format('DD/MM/YY HH:mm:ss')
  
module.exports = { color, banner, mytime }
