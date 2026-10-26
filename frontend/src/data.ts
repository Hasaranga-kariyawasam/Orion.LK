export const BRAND_LOGO_URL = 'https://pub-22e8ac07fb25460d9a84e460b0be0476.r2.dev/uploads/Tital_pic/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2011_07_33%20AM.png';

export const formatLKR = (amount: number) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
