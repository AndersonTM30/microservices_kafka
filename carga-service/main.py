from fastapi import FastAPI
from cassandra.cluster import Cluster
from kafka import KafkaProducer
import json

app = FastAPI()

# Conexão com Cassandra
cluster = Cluster(["cassandra-db"])
session = cluster.connect()
session.set_keyspace("my_keyspace")

# Kafka Producer
producer = KafkaProducer(
    bootstrap_servers='kafka:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

@app.post("/carga")
async def inserir_dados(dados: dict):
    # Inserir dados no Cassandra
    query = "INSERT INTO tabela (id, valor) VALUES (%s, %s)"
    session.execute(query, (dados["id"], dados["valor"]))

    # Enviar mensagem para Kafka
    producer.send("carga_topic", dados)

    return {"status": "Dados inseridos e mensagem enviada ao Kafka"}