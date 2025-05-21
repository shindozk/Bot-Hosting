// Configurações do bot
module.exports = {
    token: process.env.BOT_TOKEN || "YOUR_BOT_TOKEN",
    clientId: process.env.CLIENT_ID || "YOUR_CLIENT_ID",
    maxRamPerContainer: 512, // MB
    defaultLanguage: 'en', // Idioma padrão
    supportedLanguages: ['en', 'pt-br', 'fr', 'ja', 'zh', 'es'], // Idiomas suportados
    supportedProgrammingLanguages: [
        {
            id: 'javascript',
            name: 'JavaScript (Node.js)',
            description: 'Para bots escritos em JavaScript/Node.js',
            mainFileExample: 'index.js, src/index.js',
            dockerfile: `
FROM ubuntu:24.04
WORKDIR /app

# Instalar Node.js 22 LTS
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs

# Copiar arquivos do projeto
COPY . .

# Instalar dependências
RUN npm install --production

# Iniciar o bot
CMD ["node", "{{MAIN_FILE}}"]`
        },
        {
            id: 'typescript',
            name: 'TypeScript',
            description: 'Para bots escritos em TypeScript',
            mainFileExample: 'src/index.ts, index.ts',
            dockerfile: `
FROM ubuntu:24.04
WORKDIR /app

# Instalar Node.js 22 LTS
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs

# Copiar arquivos do projeto
COPY . .

# Instalar dependências e TypeScript
RUN npm install --production
RUN npm install -g typescript ts-node

# Iniciar o bot
CMD ["npx", "ts-node", "{{MAIN_FILE}}"]`
        },
        {
            id: 'python',
            name: 'Python',
            description: 'Para bots escritos em Python',
            mainFileExample: 'main.py, bot.py',
            dockerfile: `
FROM ubuntu:24.04
WORKDIR /app

# Instalar Python e pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Copiar arquivos do projeto
COPY . .

# Instalar dependências
RUN pip3 install -r requirements.txt

# Iniciar o bot
CMD ["python3", "{{MAIN_FILE}}"]`
        },
        {
            id: 'ruby',
            name: 'Ruby',
            description: 'Para bots escritos em Ruby',
            mainFileExample: 'main.rb, bot.rb',
            dockerfile: `
FROM ubuntu:24.04
WORKDIR /app

# Instalar Ruby
RUN apt-get update && apt-get install -y ruby-full

# Copiar arquivos do projeto
COPY . .

# Instalar dependências
RUN gem install bundler && bundle install

# Iniciar o bot
CMD ["ruby", "{{MAIN_FILE}}"]`
        },
        {
            id: 'go',
            name: 'Go',
            description: 'Para bots escritos em Go',
            mainFileExample: 'main.go, cmd/bot/main.go',
            dockerfile: `
FROM golang:1.22-bullseye
WORKDIR /app

# Copiar arquivos do projeto
COPY . .

# Compilar o projeto
RUN go build -o bot {{MAIN_FILE}}

# Iniciar o bot
CMD ["./bot"]`
        },
        {
            id: 'csharp',
            name: 'C# (.NET)',
            description: 'Para bots escritos em C#',
            mainFileExample: 'Program.cs, Bot.cs',
            dockerfile: `
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copiar arquivos do projeto
COPY . .

# Restaurar dependências e compilar
RUN dotnet restore
RUN dotnet publish -c Release -o out

# Imagem de runtime
FROM mcr.microsoft.com/dotnet/runtime:8.0
WORKDIR /app
COPY --from=build /app/out .

# Iniciar o bot
CMD ["dotnet", "{{PROJECT_NAME}}.dll"]`
        }
    ]
};