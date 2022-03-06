import amqp from 'amqplib'

const exchanges = [
  {name: 'mooping.exchange1', type: 'direct'},
  {name: 'mooping.exchange2', type: 'direct'},
]

const queues = [
  {name: 'mooping.q1'},
  {name: 'mooping.q2'},
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
})))

await Promise.all(queues.map((q) => channel.assertQueue(q.name, {
  durable: true,
  exclusive: false,
  autoDelete: false,
})))


await channel.bindQueue(queues[0].name, exchanges[0].name, 'key1')
await channel.bindQueue(queues[1].name, exchanges[1].name, 'key2')
await channel.bindExchange(exchanges[1].name, exchanges[0].name, 'key2')

channel.publish(exchanges[0].name, 'key1', Buffer.from('Message with routing key1'))
channel.publish(exchanges[0].name, 'key2', Buffer.from('Message with routing key2'))
