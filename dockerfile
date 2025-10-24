FROM mcr.microsoft.com/playwright/python:v1.55.0-noble

RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

RUN useradd -m appuser

WORKDIR /baseapp

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

RUN chown -R appuser:appuser /baseapp

RUN python -m playwright install

WORKDIR /baseapp/whatsappMessaging
RUN npm install

WORKDIR /baseapp

USER appuser

# Comando padrão
CMD ["python", "-m", "app.main"]
