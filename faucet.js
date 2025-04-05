const axios = require('axios');
const FormData = require('form-data');

// 2Captcha API key
const API_KEY = 'YOUR_2CAPTCHA_API_KEY';

// Wallet address yang akan digunakan untuk klaim faucet
const walletAddress = 'YOUR_WALLET_ADDRESS';

// URL faucet
const faucetUrl = 'https://0g-faucet.corenodehq.xyz'; 

// Site key hCaptcha dari halaman faucet
const siteKey = 'dcaaabbe-8882-43b0-b102-c5d69e54a91e'; 

// Fungsi untuk mendapatkan hCaptcha response dari 2Captcha
async function getCaptchaSolution() {
  try {
    // Kirim permintaan untuk menyelesaikan hCaptcha ke 2Captcha
    const response = await axios.post('http://2captcha.com/in.php', null, {
      params: {
        key: API_KEY,
        method: 'hcaptcha',
        sitekey: siteKey,
        pageurl: faucetUrl,
      },
    });

    const captchaId = response.data.split('|')[1];
    console.log('Captcha ID:', captchaId);

    // Tunggu beberapa detik sampai 2Captcha menyelesaikan captcha
    let result;
    while (true) {
      result = await axios.get('http://2captcha.com/res.php', {
        params: {
          key: API_KEY,
          action: 'get',
          id: captchaId,
        },
      });

      if (result.data.includes('OK|')) {
        return result.data.split('|')[1]; // Token hCaptcha
      }

      // Tunggu beberapa detik sebelum mencoba lagi
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } catch (error) {
    console.error('Error menyelesaikan captcha:', error);
    throw error;
  }
}

// Fungsi untuk mengklaim faucet
async function claimFaucet() {
  try {
    // Mendapatkan token hCaptcha
    const hcaptchaResponse = await getCaptchaSolution();
    console.log('Token hCaptcha:', hcaptchaResponse);

    // Kirim klaim faucet ke situs
    const form = new FormData();
    form.append('address', walletAddress);
    form.append('h-captcha-response', hcaptchaResponse);

    const response = await axios.post(faucetUrl + '/submit', form, {
      headers: form.getHeaders(),
    });

    if (response.status === 200) {
      console.log('Faucet klaim berhasil!');
    } else {
      console.log('Error klaim faucet:', response.status);
    }
  } catch (error) {
    console.error('Error dalam klaim faucet:', error);
  }
}

// Menjalankan klaim faucet
claimFaucet();
