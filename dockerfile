FROM mcr.microsoft.com/playwright/python:python-3.11-focal

WORKDIR /baseapp

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

RUN python -m playwright install

WORKDIR /baseapp/whatsappMessaging
RUN npm install

CMD ["python", "-m", "app.main"]
