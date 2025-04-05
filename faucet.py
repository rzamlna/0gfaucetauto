import time
import requests
from twocaptcha import TwoCaptcha
from dotenv import load_dotenv
import os

# Load variabel dari file .env
load_dotenv()

# Ambil API key dan wallet addresses dari file .env
API_KEY_2CAPTCHA = os.getenv('API_KEY_2CAPTCHA')
WALLET_ADDRESSES = os.getenv('WALLET_ADDRESSES').splitlines()  # Memisahkan wallet address yang berada di setiap baris

# Site key hCaptcha yang sudah ditemukan
site_key = 'dcaaabbe-8882-43b0-b102-c5d69e54a91e'
url = 'https://0g-faucet.corenodehq.xyz'  # URL faucet

# Inisialisasi solver 2Captcha
solver = TwoCaptcha(API_KEY_2CAPTCHA)

def solve_hcaptcha(wallet_address):
    try:
        # Meminta 2Captcha untuk menyelesaikan hCaptcha
        result = solver.hcaptcha(sitekey=site_key, url=url)

        # Mendapatkan token dari hasil
        hcaptcha_token = result['code']
        print(f"Token hCaptcha untuk wallet {wallet_address}: {hcaptcha_token}")

        # Kirim token ke server untuk klaim faucet
        response = requests.post(
            url='https://0g-faucet.corenodehq.xyz/submit',
            data={
                'address': wallet_address,  # Menggunakan wallet address dari daftar
                'h-captcha-response': hcaptcha_token,
            }
        )
        
        if response.status_code == 200:
            print(f"Faucet claim berhasil untuk wallet {wallet_address}!")
        else:
            print(f"Error saat klaim faucet untuk wallet {wallet_address}: {response.status_code}")
    
    except Exception as e:
        print(f"Terjadi kesalahan saat klaim faucet untuk wallet {wallet_address}: {e}")

def claim_for_all_wallets():
    # Menjalankan klaim untuk semua wallet yang ada di daftar WALLET_ADDRESSES
    for wallet_address in WALLET_ADDRESSES:
        solve_hcaptcha(wallet_address.strip())  # Menghapus spasi yang tidak perlu

if __name__ == '__main__':
    claim_for_all_wallets()
