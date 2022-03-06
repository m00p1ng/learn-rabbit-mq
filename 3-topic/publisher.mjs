import amqp from 'amqplib'

const exchangeName = 'mooping.ex.topic'

const queues = [
  {name: 'mooping.q1', pattern: '*.image.*'},
  {name: 'mooping.q2', pattern: '#.image'},
  {name: 'mooping.q3', pattern: 'image.#'},
]

const conn = await amqp.connect('amqp://guest:guest@localhost:5672')
const channel = await conn.createChannel()
process.once('SIGINT', async () => {
  await Promise.all(queues.map((q) => channel.deleteQueue(q.name)))

  await channel.deleteExchange(exchangeName)

  await channel.close()
  await conn.close()
});


await channel.assertExchange(exchangeName, 'topic', {
  durable: true,
  autoDelete: false,
})

await Promise.all(queues.map((q) => channel.assertQueue(q.name, {
  durable: true,
  exclusive: false,
  autoDelete: false,
})))

await Promise.all(queues.map((q, idx) => channel.bindQueue(q.name, exchangeName, q.pattern)))

channel.publish(exchangeName, 'convert.image.bmp', Buffer.from('Routing key is convert.image.bmp'))
channel.publish(exchangeName, 'convert.bitmap.image', Buffer.from('Routing key is convert.bitmap.image'))
channel.publish(exchangeName, 'convert.bitmap.32bit', Buffer.from('Routing key is convert.bitmap.32bit'))
