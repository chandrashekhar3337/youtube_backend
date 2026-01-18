FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# ✅ CORRECT ENTRYPOINT
CMD ["node", "src/index.js"]
