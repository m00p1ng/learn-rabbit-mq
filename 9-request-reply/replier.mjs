import amqp from 'amqplib'

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

await channel.consume(requestsQueue, (msg) => {
  const message = msg.content.toString()
  console.log(`Request received: ${message}`)

  channel.publish('', responsesQueue, Buffer.from(message))
})

