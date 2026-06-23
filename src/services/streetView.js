const METADATA_URL = 'https://maps.googleapis.com/maps/api/streetview/metadata';
const IMAGE_URL = 'https://maps.googleapis.com/maps/api/streetview';

function getApiKey() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error(
      'GOOGLE_MAPS_API_KEY が設定されていません。.env ファイルに設定してください（.env.example を参照）。'
    );
  }
  return key;
}

// 指定した住所のStreet View画像を取得する。
// 画像が存在しない住所の場合はその旨のエラーを投げる。
async function getStreetViewImage(address) {
  const apiKey = getApiKey();
  const params = new URLSearchParams({ location: address, key: apiKey });

  const metadataRes = await fetch(`${METADATA_URL}?${params.toString()}`);
  const metadata = await metadataRes.json();

  if (metadata.status !== 'OK') {
    throw new Error('この住所のストリートビュー画像が見つかりませんでした。住所を見直してお試しください。');
  }

  const imageParams = new URLSearchParams({
    location: address,
    size: '640x400',
    fov: '80',
    pitch: '10',
    key: apiKey,
  });

  const imageRes = await fetch(`${IMAGE_URL}?${imageParams.toString()}`);
  if (!imageRes.ok) {
    throw new Error('ストリートビュー画像の取得に失敗しました。');
  }

  const arrayBuffer = await imageRes.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mediaType = imageRes.headers.get('content-type') || 'image/jpeg';

  return { base64, mediaType };
}

module.exports = { getStreetViewImage };
