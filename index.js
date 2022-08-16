//Api WhatsApp//
const {
	default: makeWASocket,
	getContentType,
	DisconnectReason,
	makeInMemoryStore,
	useSingleFileAuthState
} = require ('@adiwajshing/baileys');

//Código QR
const { state, saveState } = useSingleFileAuthState('sesiones.json');

//Módulos
const fs = require('fs');
const util = require('util');
const pino = require('pino');
const fetch = require("node-fetch");

//Archivos de libreria
const Pkg = require('./package.json');
const { smsg } = require('./libreria/myfunc');
const { color, banner, mytime } = require('./libreria/funciones');

//Banner del bot en consola
console.log(banner.string);

//Ajustes :v
global.prefix = '/';
global.apikey = 'Clave-Api';

//Store
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

//Bot funcion
async function StartJs() {
const client = makeWASocket({
logger: pino({ level: 'silent' }),
	printQRInTerminal: true,
    browser: [' )[BOBERT]( ', 'Opera', '3.0.0'],
	auth: state
});

////
store.bind(client.ev);

//Conectando a WhatsApp...
client.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect } = update
if (connection == 'connecting') {
console.log(color('\nConectando...', 'blue'))
} else if (connection === 'close') {
console.log(color(`[!]`,'red'), color('Conexion perdida, reconectando... u.u', 'red'))
lastDisconnect.error?.output?.statusCode!==DisconnectReason.loggedOut?StartJs():console.log(color('\n\n[!] Sesión del dispositivo erróneo, elimine sesiones y vuelva a generar otro código QR nuevamente.\n\n','red'))
}
if (connection === 'open') {
console.log(color('\nConectado.\n', 'green'))
}
});

////
client.ev.on('creds.update', saveState);

//Actividad en WhatsApp
client.ev.on('messages.upsert', async chatUpdate => {
try {
let mek = chatUpdate.messages[0];
if (!mek.message) return
mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
if (mek.key && mek.key.remoteJid === 'status@broadcast') return
if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
m = smsg(client, mek, store);
//        
const content = JSON.stringify(mek.message)
const fromMe = mek.key.fromMe
const from = mek.key.remoteJid
const type = getContentType(mek.message)
//
const body = (type === 'conversation') ? mek.message.conversation : (type == 'imageMessage') ? mek.message.imageMessage.caption : (type == 'videoMessage') ? mek.message.videoMessage.caption : (type == 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? mek.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? mek.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? mek.message.templateButtonReplyMessage.selectedId : ''
const budy = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : ''
//
const args = body.trim().split(/ +/).slice(1)
const txt = args.join(' ')
const isCmd = body.startsWith(prefix)
const command = body.startsWith(prefix) ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : ''
//
const quoted = m.quoted ? m.quoted : mek
const mime = (quoted.msg || quoted).mimetype || ''
const isMedia = /image|video|sticker|audio/.test(mime)
//
const isGroup = from.endsWith('@g.us')
const sender = isGroup ? (mek.key.participant ? mek.key.participant : mek.participant) : mek.key.remoteJid
const pushname =  mek.pushName || "A/Z"
const botNumber = client.user.id.split(':')[0] + "@s.whatsapp.net"
//
const groupMetadata = isGroup ? await client.groupMetadata(from).catch(e => {}) : ''
const groupId = isGroup ? groupMetadata.id : ""
const groupOwner = isGroup ? groupMetadata.owner : ""
const groupDesc = isGroup ? groupMetadata.desc : ""
const groupName = isGroup ? groupMetadata.subject : ""
const groupMembers = isGroup ? await groupMetadata.participants : ''
const groupAdmins = isGroup ? await groupMembers.filter(v => v.admin !== null).map(v => v.id) : ''
const isBotGroupAdmins = isGroup ?  groupAdmins.includes(botNumber) : false
const isGroupAdmins = isGroup ?  groupAdmins.includes(sender) : false
//
let rpt = (texto) => { client.sendMessage(from, {text: texto}, { quoted: mek}) }
//
console.log('\x1b[1;31m~\x1b[1;37m>', color('[', 'white'), color(isCmd ? 'EJECUTANDO' : 'MENSAJE', 'blue'), color(']', 'white'), color('{', 'green'), color(budy || type || isCmd, 'yellow'), color('}', 'green'), color(isCmd ? 'Por' : 'De', 'blue'), color(pushname, 'cyan'), 'Chat', isGroup ? color('grupo:'+isGroup ? groupName : "", 'green') : color('Privado:'+sender, 'red'), 'Fecha', color(mytime, 'magenta'));
////
switch (command) {
//
case 'menu':
case 'help':
case 'comandos':
await client.sendMessage(from, {text:
`
*Hola ${pushname}!*
_Aqui puedes ver mi lista de comandos:_

${Pkg.name} v${Pkg.version}

~> Con prefijo:
\`\`\`
${prefix}play
${prefix}creador
\`\`\`

~> Sin prefijo:
\`\`\`
onichan
\`\`\`


~Fecha: ${mytime}~
`.trim()
}, { quoted: mek})
break;
case 'play':
if (!txt) return rpt('Que desea buscar?')
try {
const dtApi = await fetch('https://latam-api.vercel.app/api/ytplay?apikey='+apikey+'&q='+txt)
const jsonApi = await dtApi.json()
await client.sendMessage(from, { image: {url: jsonApi.logo}, caption:
`
\`\`\`
• Titulo: ${jsonApi.titulo}
• Duración: ${jsonApi.duracion}
• Vistas: ${jsonApi.vistas}
• Autor: ${jsonApi.autor}
• Descripción: ${jsonApi.descripcion}
\`\`\`

_Enviando audio, por favor espere..._
`.trim()
}, { quoted: mek })
//
client.sendMessage(from, { audio: { url: jsonApi.descarga }, mimetype: 'audio/mpeg', fileName: jsonApi.titulo+'.mp3'}, { quoted: mek }).catch(e => {console.log(e)})
} catch {
client.sendMessage(from, {text: 'Ocurrio un error inesperado!'}, { quoted: mek})
}
break;
case 'creador':
case 'dueño':
case 'owner':
const vcard =
'BEGIN:VCARD\n'
+ 'VERSION:3.0\n' 
+ 'FN:NeKosmic\n'
+ 'ORG:N_K_\n'
+ 'TEL;type=CELL;type=VOICE;waid=51995386439:51 995 386 439\n'
+ 'END:VCARD'
client.sendMessage(from,{ contacts: { displayName: 'Jeff',
contacts: [{ vcard }] }},{quoted:mek})
break;
//
default: 
//
if (budy.match(/onichan|Onichan|oni-chan|Oni-chan|oni chan|Oni chan/g)){
client.sendMessage(from, {text: 'Nya! ÙwÚ'}, { quoted: mek})
}
//
}
//
} catch(e) {
console.log(util.format(e))
}
});
}
//start!
StartJs();
