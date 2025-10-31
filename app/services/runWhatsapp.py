import subprocess

def runWhatsapp(message):
    
    subprocess.run(['node', 'whatsappMessaging/index.js', message])