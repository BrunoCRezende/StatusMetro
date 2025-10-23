from playwright.sync_api import sync_playwright
from app.services.getStatus import getInfo


def main():
    with sync_playwright() as p:
        browser =  p.chromium.launch(headless=True)
        context =  browser.new_context()
        getInfo(context)

        browser.close()
        context.close()

if __name__ == "__main__":
    main()

