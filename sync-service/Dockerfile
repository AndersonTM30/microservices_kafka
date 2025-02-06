FROM node:18

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o arquivo main.ts, tsconfig.json e o package.json
COPY main.ts .
COPY tsconfig.json .
COPY package.json .

# Inicializa as dependências
RUN npm install

# Comando para rodar o script com ts-node
CMD ["npm", "start"]
