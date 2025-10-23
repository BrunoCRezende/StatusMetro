
def getInfo(context):
    def getOfficialLineStatus(context):
        page = context.new_page()
        page.goto("https://www.metro.sp.gov.br/pt_BR/sua-viagem/direto-metro")
        page.wait_for_load_state("networkidle")

        frames = page.frames
        frame = frames[1]

        table = frame.locator(".list-group-flush")
        linhas = table.locator("li")
        linhasMetro = []

        for i in range(linhas.count()):
            item = linhas.nth(i)
            linhasMetro.append(item.inner_text() + "\n")

        for item in linhasMetro:
            print(item)

    def getRecentNews(context):
        page = context.new_page()
        page.goto("https://news.google.com/search?q=metro%20são%20paulo%20agora%20when%3A5h&hl=pt-BR&gl=BR&ceid=BR%3Apt-419")
        page.wait_for_load_state("networkidle")

        div = page.locator(".UW0SDc")
        noticia = div.locator(".PO9Zff")
        noticias = []
        for i in range(4):
            item = noticia.nth(i)
            noticias.append(item.inner_text() + '\n')

        for item in noticias:
            print(item)


    getOfficialLineStatus(context)
    getRecentNews(context)
