from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()

def googleIA(StatusOficial, Noticias):
    client = genai.Client(api_key= os.getenv("GEMINI_API_KEY"))

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            system_instruction=""" 
            Você é uma inteligência artificial especialista em transporte urbano, com foco no Metrô de São Paulo. 
            Seu papel é ler e interpretar dados recentes sobre o funcionamento das linhas do metrô, incluindo:
            - Notícias de portais de jornalismo,
            - Comunicados e dados oficiais do Metrô de São Paulo.

            Com base nas informações recebidas, gere um resumo informativo e natural, descrevendo a situação atual das linhas.

            Regras:
            1. Seja neutro e objetivo — evite opiniões pessoais.
            2. Priorize informações verificáveis (notícias e dados oficiais).
            3. Sempre contextualize — mencione a linha afetada e o tipo de problema, se disponível.
            4. Mantenha o texto curto (máximo de 2 parágrafos) e fácil de entender.
            5. Se não houver dados suficientes, diga algo como:
            “Não há relatos recentes de falhas ou ocorrências no Metrô de São Paulo.”

            Formato esperado:
            - Comece citando as ocorrências específicas (“Na Linha 3-Vermelha, ocorreu uma falha técnica…”).
            - Termine com uma observação de status (“A operação já foi normalizada, segundo o Metrô.”).
            """),
        contents=f"""
        metro de São Paulo oficial::  {StatusOficial}

        Noticias Recentes:: {Noticias}
        """
    )

    print(response.text)