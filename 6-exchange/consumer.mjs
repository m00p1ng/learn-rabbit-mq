import amqp from 'amqplib'

const queues = [
  {name: 'mooping.q1'},
  {name: 'mooping.q2'},
]

const conn = await amqp.connect('amqp://guest:guest@localhost:5672')
const channel = await conn.createChannel()

process.once('SIGINT', function () {conn.close();});
queues.forEach(q => console.log(" [*] Waiting for messages in %s.", q))

await Promise.all(queues.map((q) => channel.assertQueue(q.name, {
  durable: true,
  exclusive: false,
  autoDelete: false,
})))

await Promise.all(queues.map((q) => channel.consume(q.name, (msg) => {
  console.log(" [x][%s] Received %s", q.name, msg.content.toString());
}, {noAck: true})))
