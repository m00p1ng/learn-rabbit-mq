import amqp from 'amqplib'

const exchangeName = 'mooping.ex.headers'

const queues = [
  {
    name: 'mooping.q1',
    args: {
      'x-match': 'all',
      'job': 'convert',
      'format': 'jpeg',
    }
  },
  {
    name: 'mooping.q2',
    args: {
      'x-match': 'any',
      'job': 'convert',
      'format': 'jpeg',
    },
  },
]

const conn = await amqp.connect('amqp://guest:guest@localhost:5672')
const channel = await conn.createChannel()
process.once('SIGINT', async () => {
  await Promise.all(queues.map((q) => channel.deleteQueue(q.name)))

  await channel.deleteExchange(exchangeName)

  await channel.close()
  await conn.close()
});


await channel.assertExchange(exchangeName, 'headers', {
  durable: true,
  autoDelete: false,
})

await Promise.all(queues.map((q) => channel.assertQueue(q.name, {
  durable: true,
  exclusive: false,
  autoDelete: false,
})))

await Promise.all(queues.map((q, idx) => channel.bindQueue(q.name, exchangeName, '', q.args)))

channel.publish(exchangeName, '', Buffer.from('Message 1'), {
  headers: {
    'job': 'convert',
    'format': 'jpeg',
  }
})
channel.publish(exchangeName, '', Buffer.from('Message 2'), {
  headers: {
    'job': 'convert',
    'format': 'bmp',
  }
})
