FROM confluentinc/cp-kafka-connect-base:latest

# Instala o conector JDBC para PostgreSQL
RUN confluent-hub install confluentinc/kafka-connect-jdbc:latest --no-prompt

# Baixa o driver MySQL JDBC
RUN curl -L -o /usr/share/java/mysql-connector-java.jar https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.32/mysql-connector-java-8.0.32.jar

# Baixa o driver PostgreSQL JDBC
RUN curl -L -o /usr/share/java/postgresql-connector-java.jar https://repo1.maven.org/maven2/org/postgresql/postgresql/42.5.4/postgresql-42.5.4.jar

# Substitui o valor padrão de bootstrap.servers no arquivo de configuração
RUN sed -i 's/^\(bootstrap.servers=\).*/\1kafka:9092/' /etc/kafka/connect-distributed.properties

CMD ["connect-distributed", "/etc/kafka/connect-distributed.properties"]
