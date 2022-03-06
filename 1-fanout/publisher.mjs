import amqp from 'amqplib'

const conn = await amqp.connect('amqp://guest:guest@localhost:5672')
const channel = await conn.createChannel()

const exchangeName = 'mooping.ex.fanout'
const queue1Name = 'mooping.queue1'
const queue2Name = 'mooping.queue2'

await channel.assertExchange(exchangeName, 'fanout', {
  durable: true,
  autoDelete: false,
})

await channel.assertQueue(queue1Name, {
  durable: true,
  exclusive: false,
  autoDelete: false,
})

await channel.assertQueue(queue2Name, {
  durable: true,
  exclusive: false,
  autoDelete: false,
})

await channel.bindQueue(queue1Name, exchangeName)
await channel.bindQueue(queue2Name, exchangeName)

channel.publish(exchangeName, '', Buffer.from('mooping.2'))
channel.publish(exchangeName, '', Buffer.from('mooping.3'))

setTimeout(async () => {
  await channel.deleteQueue(queue1Name)
  await channel.deleteQueue(queue2Name)

  await channel.deleteExchange(exchangeName)

  await channel.close()
  await conn.close()
}, 10000)


