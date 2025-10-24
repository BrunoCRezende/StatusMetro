FROM mcr.microsoft.com/playwright:v1.55.0-noble

WORKDIR /baseapp

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Instalar navegadores do Playwright
RUN python -m playwright install

# Entrar na pasta Node e instalar dependências
WORKDIR /baseapp/whatsappMessaging
RUN npm install

# Comando de start (substitua pelo seu)
CMD ["python", "-m", "app.main"]
