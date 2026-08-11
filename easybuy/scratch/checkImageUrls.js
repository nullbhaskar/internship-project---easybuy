const https = require('https');

const urls = [
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
  'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800',
  'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800',
  'https://images.unsplash.com/photo-1511196707516-c3a6032120e2?w=800',
  'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
  'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800',
  'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
  'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800',
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=800',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
  'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
  'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800',
  'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
  'https://images.unsplash.com/photo-1534215754734-18e52d13e540?w=800',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800',
  'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800',
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
  'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800',
  'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800',
  'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
  'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800',
  'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
  'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800',
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800',
  'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=800',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800',
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
  'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800',
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
  'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=800',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
  'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
  'https://images.unsplash.com/photo-1532009877282-3340270e0529?w=800',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
  'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', () => {
      resolve({ url, status: 500 });
    });
  });
}

async function main() {
  console.log('Testing URLs...');
  const broken = [];
  for (const url of urls) {
    const res = await checkUrl(url);
    if (res.status !== 200 && res.status !== 301 && res.status !== 302) {
      console.log(`❌ BROKEN (${res.status}): ${url}`);
      broken.push(url);
    }
  }
  console.log(`\nFinished checking ${urls.length} URLs. Broken count: ${broken.length}`);
}

main();
