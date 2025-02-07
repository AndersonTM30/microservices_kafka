# Aplicação de Microsserviços com Kafka, KrakenD, Kafka Connect, CassandraDB, PostgreSQL e MySQL

Este projeto demonstra a integração de microsserviços utilizando diversas tecnologias modernas. A aplicação é composta pelos seguintes componentes:

- **API Gateway com KrakenD:** Centraliza o acesso aos serviços, roteando as chamadas para os endpoints corretos.
- **Serviço de Carga (`carga-service`):** Desenvolvido em Python com FastAPI, recebe requisições, insere os dados no CassandraDB e envia mensagens para o Apache Kafka.
- **Serviço de Sincronização (`sync-service`):** Desenvolvido em TypeScript com Node.js, consome mensagens do Kafka e insere os dados no PostgreSQL.
- **Kafka Connect:** Observa atualizações no PostgreSQL e sincroniza os dados para um banco MySQL externo.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura e Fluxo da Aplicação](#arquitetura-e-fluxo-da-aplicação)
3. [Descrição dos Componentes e Tecnologias](#descrição-dos-componentes-e-tecnologias)
   - [Docker e Docker Compose](#docker-e-docker-compose)
   - [KrakenD (API Gateway)](#krakend-api-gateway)
   - [carga-service](#carga-service)
   - [sync-service](#sync-service)
   - [Apache Kafka](#apache-kafka)
   - [Kafka Connect](#kafka-connect)
   - [CassandraDB](#cassandradb)
   - [PostgreSQL](#postgresql)
   - [MySQL](#mysql)
4. [Preparação do Ambiente e Execução do Processo do Zero](#preparação-do-ambiente-e-execução-do-processo-do-zero)
   - [Pré-requisitos](#pré-requisitos)
   - [Passo a Passo para Execução](#passo-a-passo-para-execução)
5. [Testando a Aplicação](#testando-a-aplicação)
6. [Considerações Finais](#considerações-finais)
7. [Referências e Links Úteis](#referências-e-links-úteis)

---

## Visão Geral

Esta aplicação demonstra a integração de microsserviços utilizando diversas tecnologias modernas. O protótipo abrange:

- **API Gateway (KrakenD):** Centraliza as requisições e as direciona para os serviços responsáveis.
- **carga-service:** Recebe dados via requisição HTTP, insere no CassandraDB e publica uma mensagem no Kafka.
- **sync-service:** Consome mensagens do Kafka e insere os dados no PostgreSQL.
- **Kafka Connect:** Sincroniza as alterações do PostgreSQL com um banco MySQL externo.

---

## Arquitetura e Fluxo da Aplicação
![<fluxo_da_aplicacao>](<./assets/fluxo.png>)

1. **Cliente → KrakenD:** O cliente envia uma requisição HTTP (POST) para o endpoint `/carga` do KrakenD.
2. **KrakenD → carga-service:** O API Gateway redireciona a chamada para o serviço de carga.
3. **carga-service:** 
   - Insere os dados no CassandraDB.
   - Envia uma mensagem para o tópico `carga_topic` no Kafka.
4. **Kafka → sync-service:** O `sync-service` consome a mensagem e insere os dados no PostgreSQL.
5. **Kafka Connect:** Monitora o PostgreSQL e sincroniza os dados com o MySQL.

---

## Descrição dos Componentes e Tecnologias

### Docker e Docker Compose

- **Função:** Containerizar e orquestrar os diversos componentes do sistema.
- **Configuração:** O arquivo `docker-compose.yml` define os serviços, redes e volumes persistentes.

### KrakenD (API Gateway)

- **Função:** Centralizar e rotear as requisições HTTP para os microsserviços.
- **Configuração:** No arquivo `krakend.json` estão definidos os endpoints:
  - `/carga` → direcionado ao `carga-service`
  - `/connectors` → direcionado ao `kafka-connect`

### carga-service

- **Tecnologias:** Python, FastAPI, SQLAlchemy (para interagir com o CassandraDB) e `kafka-python` para integração com o Kafka.
- **Fluxo:**
  - Recebe os dados via requisição.
  - Insere os dados na tabela do CassandraDB.
  - Publica uma mensagem no tópico `carga_topic` do Kafka.
- **Código Principal:** `main.py`

### sync-service

- **Tecnologias:** Node.js, TypeScript, e a biblioteca `kafkajs` para consumir mensagens do Kafka.
- **Fluxo:**
  - Consome mensagens do tópico `carga_topic`.
  - Insere os dados no PostgreSQL utilizando a biblioteca `pg`.
- **Código Principal:** `main.ts`

### Apache Kafka

- **Função:** Sistema de mensageria que conecta os serviços de carga e sincronização.
- **Configuração:** Executado via container (imagem Bitnami) e responsável pela criação automática de tópicos e gerenciamento das mensagens.

### Kafka Connect

- **Função:** Sincronizar os dados entre o PostgreSQL e o MySQL.
- **Configurações Disponíveis:**
  - **Source Connector:** (`connector_config.json`) para extrair dados do PostgreSQL.
  - **Sink Connector:** (`mysql-sink.json`) para inserir os dados no MySQL.
- **Imagem Utilizada:** `confluentinc/cp-kafka-connect-base`.

### CassandraDB

- **Função:** Armazenar os dados brutos inseridos pelo `carga-service`.
- **Configuração:** Container executando a imagem oficial do Cassandra.  
  **Atenção:** Certifique-se de criar o keyspace `my_keyspace` e a tabela `tabela` (veja instruções abaixo).

### PostgreSQL

- **Função:** Armazenar os dados sincronizados processados pelo `sync-service`.
- **Configuração:** Container executando a imagem oficial do PostgreSQL.  
  **Atenção:** Crie a tabela `tabela` com as colunas `id`, `valor` e `updated_at` (usada pelo conector JDBC).

### MySQL

- **Função:** Receber os dados sincronizados via Kafka Connect.
- **Configuração:** Este serviço é externo e deve ser configurado conforme o ambiente. Ajuste a URL e as credenciais no conector `mysql-sink.json`.

---

# Preparação do Ambiente e Execução do Processo do Zero

### Pré-requisitos

- **Docker e Docker Compose:** Certifique-se de ter o Docker instalado e o comando `docker-compose` disponível.
- **Git:** Para clonar o repositório com o código fonte.

### Passo a Passo para Execução

1. **Clonar o Repositório:**
    
    ```bash
    git clone https://github.com/AndersonTM30/microservices_kafka.git
    cd microservices_kafka
    ```
    
2. **Configuração Inicial do Cassandra e PostgreSQL:**
    - **Cassandra:**
        - Após iniciar o container, conecte-se ao Cassandra (por exemplo, utilizando o `cqlsh`):
        
            ``` bash
            docker exec -it cassandra-db cqlsh
            ```

        - Crie o keyspace e a tabela necessários:
            
            ```sql
            CREATE KEYSPACE my_keyspace WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
            USE my_keyspace;
            CREATE TABLE tabela (id text PRIMARY KEY, valor text);
            ```
            
        - *Observação:* Adapte o esquema conforme os dados que serão inseridos.
    - **PostgreSQL:**
        - Conecte-se ao container do PostgreSQL (por exemplo, via `psql`):
            ```
            docker exec -it postgres-db psql -U postgres
            ```
        
        - Crie a tabela:
            
            ```sql
            CREATE TABLE tabela (
              id PRIMARY KEY,
              valor text
            );
            ```
            
3. **Iniciar os Containers:**
    
    Execute o comando a partir da raiz do repositório onde se encontra o `docker-compose.yml`:
    
    ```bash
    docker-compose up --build
    ```
    
    Esse comando:
    
    - Constrói as imagens dos serviços `carga-service` e `sync-service`.
    - Inicializa os containers para Cassandra, PostgreSQL, Kafka, Kafka Connect e KrakenD.
    - Garante que os serviços dependentes iniciem somente após a saúde (healthcheck) dos serviços críticos (por exemplo, Kafka e Cassandra).
4. **Configurar os Conectores do Kafka Connect:**
    
    Após os containers estarem rodando, utilize o KrakenD para enviar as configurações dos conectores via API. Por exemplo, para criar o conector de fonte:
    
    ```bash
    curl -X POST \
      http://localhost:8080/connectors \
      -H "Content-Type: application/json" \
      -d @connector_config.json
    ```
    
    E para o conector de sink para MySQL:
    
    ```bash
    curl -X POST \
      http://localhost:8080/connectors \
      -H "Content-Type: application/json" \
      -d @mysql-sink.json
    ```
    
    *Observação:* Caso deseje testar a sincronização, certifique-se de que o MySQL esteja acessível na URL especificada ou ajuste a configuração conforme o ambiente.
    

---

## Testando a Aplicação

1. **Enviar Dados via Rota de Carga:**
    
    Utilize uma ferramenta como *Postman*, *Insomnia* ou mesmo o `curl` para enviar uma requisição HTTP para o endpoint do KrakenD que redireciona para o `carga-service`:
    
    ```bash
    curl -X POST \
      http://localhost:8080/carga \
      -H "Content-Type: application/json" \
      -d '{"id": "1237", "valor": "Teste de integração"}'
    ```
    
    **O que ocorre:**
    
    - O `carga-service` insere os dados no CassandraDB.
    - Em seguida, uma mensagem é enviada para o tópico `carga_topic` do Kafka.
2. **Verificar a Sincronização:**
    - O `sync-service` (consumidor Kafka) processa a mensagem e insere os dados no PostgreSQL.
    - Confira os logs do `sync-service` para ver a mensagem de confirmação:
        
        ```
        Dados sincronizados: { id: '1237', valor: 'Teste de integração' }
        ```
        
    - Por fim, o Kafka Connect deve capturar a atualização no PostgreSQL e sincronizar os dados para o MySQL (de acordo com as configurações dos conectores).
3. **Monitoramento:**
    - Utilize os comandos do Docker para inspecionar logs:
        
        ```bash
        docker-compose logs -f kafka
        docker-compose logs -f carga-service
        docker-compose logs -f sync-service
        ```
        
    - Essas verificações ajudam a identificar eventuais problemas na comunicação entre os serviços.

---

## Considerações Finais

- **Modularidade:** A separação dos serviços permite escalabilidade individual e a possibilidade de implementar novas funcionalidades sem interferir em todo o sistema.
- **Tecnologias Mistas:** A escolha de implementar serviços em Python e TypeScript demonstra a flexibilidade dos microsserviços, onde cada componente pode utilizar a tecnologia que melhor atende aos requisitos específicos.
- **Orquestração com Docker:** O uso do Docker Compose simplifica a inicialização e o gerenciamento do ambiente, tornando o protótipo facilmente replicável em diferentes ambientes (desenvolvimento, testes, produção).

---

## Referências e Links Úteis

- [Documentação do Docker Compose](https://docs.docker.com/compose/)
- [KrakenD - API Gateway](https://www.krakend.io/)
- [Apache Kafka](https://kafka.apache.org/)
- [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html)
- [Cassandra Documentation](https://cassandra.apache.org/doc/latest/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Kafkajs Documentation](https://kafka.js.org/)
- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)


