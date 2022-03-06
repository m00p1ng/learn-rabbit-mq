import amqp from 'amqplib'

const infoQueue = 'mooping.info'
const warningQueue = 'mooping.warning'
const errorQueue = 'mooping.error'

const queues = [
  infoQueue,
  warningQueue,
  errorQueue,
]

const conn = await amqp.connect('amqp://guest:guest@localhost:5672')
const channel = await conn.createChannel()

process.once('SIGINT', function () {conn.close();});
queues.forEach(q => console.log(" [*] Waiting for messages in %s.", q))


await Promise.all(queues.map((q) => channel.assertQueue(q, {
  durable: true,
  exclusive: false,
  autoDelete: false,
})))

await Promise.all(queues.map((q) => channel.consume(q, (msg) => {
  console.log(" [x][%s] Received %s", q, msg.content.toString());
}, {noAck: true})))
