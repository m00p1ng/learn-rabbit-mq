import amqp from 'amqplib'
import readline from 'readline'

const requestsQueue = 'mooping.requests'
const responsesQueue = 'mooping.responses'

const conn = await amqp.connect('amqp://guest:guest@localhost:5672')
const channel = await conn.createChannel()
process.once('SIGINT', async () => {
  await channel.close()
  await conn.close()
});

await channel.assertQueue(requestsQueue, {
  durable: true,
  autoDelete: false,
})

await channel.assertQueue(responsesQueue, {
  durable: true,
  autoDelete: false,
})

await channel.consume(responsesQueue, (msg) => {
  const message = msg.content.toString()
  console.log(`Response received: ${message}`)
})

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
  prompt: 'Enter your request: ',
});


rl.on('line', (input) => {
  channel.publish('', requestsQueue, Buffer.from(input))
})
