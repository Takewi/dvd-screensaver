# ==========================================
# Estágio 1: Build e Minificação dos Assets
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copia dependências e instala
COPY package*.json ./
RUN npm ci || npm install

# Copia código-fonte e executa o build/minificação com Vite
COPY . .
RUN npm run build

# ==========================================
# Estágio 2: Servidor Web Nginx (Porta 80)
# ==========================================
FROM nginx:alpine

# Copia configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia artefatos minificados do estágio de build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
