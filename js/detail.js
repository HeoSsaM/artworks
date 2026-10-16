import { supabase, won } from './common.js';

const message = document.querySelector('#detail-message');
const detail = document.querySelector('#art-detail');
const image = document.querySelector('#detail-image');
const placeholder = document.querySelector('#detail-placeholder');

async function loadArtwork() {
  const id = new URLSearchParams(window.location.search).get('id');

  if (!id || !/^\d+$/.test(id)) {
    message.textContent = '올바른 작품 ID가 아닙니다.';
    return;
  }

  const { data: artwork, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    message.textContent = `작품 조회에 실패했습니다: ${error.message}`;
    return;
  }

  if (!artwork) {
    message.textContent = '해당 작품을 찾을 수 없습니다.';
    return;
  }

  document.querySelector('#detail-category').textContent = artwork.category || '';
  document.querySelector('#detail-title').textContent = artwork.title || '';
  document.querySelector('#detail-artist').textContent = artwork.artist || '';
  document.querySelector('#detail-description').textContent = artwork.description || '등록된 작품 설명이 없습니다.';
  document.querySelector('#detail-price').textContent = won(artwork.price);
  document.querySelector('#detail-rental-price').textContent = won(artwork.rental_price);

  if (artwork.image_url) {
    image.src = artwork.image_url;
    image.alt = artwork.title || '작품 이미지';
    image.hidden = false;
    placeholder.hidden = true;
  } else {
    image.hidden = true;
    placeholder.hidden = false;
  }

  detail.hidden = false;
  message.hidden = true;
}

loadArtwork();
