from playwright.sync_api import sync_playwright
from app.services.getStatus import getInfo
from app.services.aiRequest import googleIA
from app.services.runWhatsapp import runWhatsapp


def main():
    with sync_playwright() as p:
        browser =  p.chromium.launch(headless=True)
        context =  browser.new_context()
        
        modelo = "gemini-2.5-flash"

        StatusOficial, Noticias = getInfo(context)
        message = googleIA(modelo, StatusOficial, Noticias)
        runWhatsapp(message)

        browser.close()
        context.close()

if __name__ == "__main__":
    main()

