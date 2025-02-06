import { Kafka } from 'kafkajs';
import pg from 'pg';
const { Client } = pg;

async function startConsumer() {
  try {
    // Kafka setup
    const kafka = new Kafka({
      clientId: 'sync-service',
      brokers: ['kafka:9092'],
    });

    const consumer = kafka.consumer({ groupId: 'sync-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'carga_topic', fromBeginning: true });

    // PostgreSQL setup
    const client = new Client({
      user: 'user',
      host: 'postgres-db',
      database: 'mydb',
      password: 'password',
      port: 5432,
    });
    await client.connect();

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ message }) => {
        const dados = JSON.parse(message.value.toString());
        const query = 'INSERT INTO tabela (id, valor) VALUES ($1, $2)';
        await client.query(query, [dados.id, dados.valor]);
        console.log('Dados sincronizados:', dados);
      },
    });
  } catch (error) {
    console.error('Erro no consumer:', error);
  }
}

startConsumer();