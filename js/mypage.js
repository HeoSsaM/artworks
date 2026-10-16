// [수업 목표] 로그인한 회원의 대여/구매 신청 내역만 조회하기
import { supabase, getUser, escapeHTML, won } from './common.js';
const list = document.querySelector('#my-orders');
const heading = document.querySelector('#user-email');

async function loadMyPage() {
  const user = await getUser();
  if (!user) {
    location.href = 'login.html';
    return;
  }
  heading.textContent = user.email; // 로그인한 사람의 이메일 표시

  // orders = 신청 테이블, art_space = 작품 테이블
  // art_space(...)는 외래 키로 연결된 작품의 일부 컬럼을 함께 조회합니다.
  // DB에 외래 키 관계가 설정되어 있어야 합니다.
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_type, created_at, art_space(title, price, rental_price)')
    .eq('user_id', user.id) // 내 회원 ID와 같은 신청만 조회
    .order('id', { ascending: false }); // 최신 id부터 내림차순 정렬

  if (error) {
    list.textContent = '조회 오류: ' + error.message;
    return;
  }

  list.innerHTML = ''; // 기존 로딩 문구 지우기
  if (data.length === 0) { // 조회 결과가 0건일 때
    list.textContent = '아직 신청 내역이 없습니다.';
    return;
  }

  // forEach(): 신청 내역 배열의 항목을 하나씩 처리합니다.
  data.forEach((order) => {
    const art = order.art_space; // 이 신청과 연결된 작품 객체
    let title = '삭제된 작품';
    let price = '-';

    if (art) {
      title = art.title;
      // rent이면 월 대여료, 아니면 구매가를 표시합니다.
      if (order.order_type === 'rent') price = won(art.rental_price);
      else price = won(art.price);
    }

    let type = '구매 신청';
    if (order.order_type === 'rent') type = '대여 신청';

    // 예: 2026-10-15T... -> 한국식 날짜 표시
    const date = new Date(order.created_at).toLocaleDateString('ko-KR');

    // += 는 기존 HTML 뒤에 신청 카드 1개를 추가하는 뜻입니다.
    list.innerHTML += `
      <div class="order-row">
        <div><strong>${escapeHTML(title)}</strong><p>${type} · ${date}</p></div>
        <span>${price}</span>
      </div>`;
  });
}

loadMyPage(); // 페이지가 열리면 내 신청 목록 조회 시작
