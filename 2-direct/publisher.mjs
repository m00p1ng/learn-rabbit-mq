import amqp from 'amqplib'

const exchangeName = 'mooping.ex.direct'
const infoQueue = 'mooping.info'
const warningQueue = 'mooping.warning'
const errorQueue = 'mooping.error'

const queues = [
  infoQueue,
  warningQueue,
  errorQueue,
]

const patterns = [
  'info',
  'warning',
  'error',
]

const conn = await amqp.connect('amqp://guest:guest@localhost:5672')
const channel = await conn.createChannel()
process.once('SIGINT', async () => {
  await Promise.all(queues.map((q) => channel.deleteQueue(q)))

  await channel.deleteExchange(exchangeName)

  await channel.close()
  await conn.close()
});


await channel.assertExchange(exchangeName, 'direct', {
  durable: true,
  autoDelete: false,
})

await Promise.all(queues.map((q) => channel.assertQueue(q, {
  durable: true,
  exclusive: false,
  autoDelete: false,
})))

await Promise.all(queues.map((q, idx) => channel.bindQueue(q, exchangeName, patterns[idx])))

channel.publish(exchangeName, 'info', Buffer.from('Message with routing key info'))
