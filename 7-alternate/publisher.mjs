import amqp from 'amqplib'

const exchanges = [
  {
    name: 'mooping.ex.fanout',
    type: 'fanout',
  },
  {
    name: 'mooping.ex.direct',
    type: 'direct',
    options: {alternateExchange: 'mooping.ex.fanout'}
  },
]

const queues = [
  {name: 'mooping.q1'},
  {name: 'mooping.q2'},
  {name: 'mooping.unrouted'},
]

const conn = await amqp.connect('amqp://guest:guest@localhost:5672')
const channel = await conn.createChannel()
process.once('SIGINT', async () => {
  await Promise.all(queues.map((q) => channel.deleteQueue(q.name)))
  await Promise.all(exchanges.map((ex) => channel.deleteExchange(ex.name)))

  await channel.close()
  await conn.close()
});


await Promise.all(exchanges.map((ex) => channel.assertExchange(ex.name, ex.type, {
  durable: true,
  autoDelete: false,
  ...ex.options,
})))

await Promise.all(queues.map((q) => channel.assertQueue(q.name, {
  durable: true,
  exclusive: false,
  autoDelete: false,
})))

await channel.bindQueue(queues[0].name, exchanges[1].name, 'video')
await channel.bindQueue(queues[1].name, exchanges[1].name, 'image')
await channel.bindQueue(queues[2].name, exchanges[0].name, '')

channel.publish(exchanges[1].name, 'video', Buffer.from('Message with routing key video'))
channel.publish(exchanges[1].name, 'text', Buffer.from('Message with routing key text'))
