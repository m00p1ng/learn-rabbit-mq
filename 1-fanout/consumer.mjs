import amqp from 'amqplib'

const queueName = 'mooping.queue1'

const conn = await amqp.connect('amqp://guest:guest@localhost:5672')
const channel = await conn.createChannel()
console.log(" [*] Waiting for messages in %s.", queueName);

process.once('SIGINT', function () {conn.close();});

await channel.assertQueue(queueName, {
  durable: true,
  exclusive: false,
  autoDelete: false,
})

channel.consume(queueName, (msg) => {
  console.log(" [x] Received %s", msg.content.toString());
}, {noAck: true})
