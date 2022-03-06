import amqp from 'amqplib'

const queueName = 'mooping.q1'
const workerName = process.argv[2]

const conn = await amqp.connect('amqp://guest:guest@localhost:5672')
const channel = await conn.createChannel()
process.once('SIGINT', async () => {
  await channel.close()
  await conn.close()
});

await channel.assertQueue(queueName, {
  durable: true,
  exclusive: false,
  autoDelete: false,
})

channel.consume(queueName, async (msg) => {
  console.log(" [x][%s] Received %s", workerName, msg.content.toString());
  const seconds = parseInt(msg.content.toString()) * 1000
  await new Promise((resolve) => setTimeout(resolve, seconds))
  console.log('finished')
})
