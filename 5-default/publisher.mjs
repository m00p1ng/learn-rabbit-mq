import amqp from 'amqplib'

const queues = [
  {name: 'mooping.q1'},
  {name: 'mooping.q2'},
]

const conn = await amqp.connect('amqp://guest:guest@localhost:5672')
const channel = await conn.createChannel()
process.once('SIGINT', async () => {
  await Promise.all(queues.map((q) => channel.deleteQueue(q.name)))

  await channel.close()
  await conn.close()
});


await Promise.all(queues.map((q) => channel.assertQueue(q.name, {
  durable: true,
  exclusive: false,
  autoDelete: false,
})))

channel.publish('', queues[0].name, Buffer.from('Message with routing key q1'))
