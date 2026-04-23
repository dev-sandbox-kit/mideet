# Mideet 서비스 설계 문서

**작성일:** 2026-04-23  
**프로젝트:** mideet — 여러 위치의 사람들을 위한 중간지점 약속 서비스

---

## 1. 개요

여러 곳에 사는 사람들이 만날 장소를 정할 때, 모든 참여자의 위치를 기반으로 실제 이동시간이 최소화되는 중간지점(지하철역)을 찾아주고 주변 장소를 추천하는 웹 서비스.

---

## 2. 핵심 요건

| 항목 | 내용 |
|------|------|
| 플랫폼 | 웹앱 (모바일 반응형) |
| 인증 | 없음 — 링크 공유 방식 |
| 최대 참여자 | 10명 |
| 위치 입력 | 카카오 주소 검색 |
| 중간지점 계산 | 지하철역 기반 실이동시간 최적화 |
| 장소 추천 | 카카오 Local API + 카테고리 필터 |
| 결과 공유 | 이미지 다운로드 (지도 + 추천 장소) |
| 데이터 보존 | 방 생성 후 3일 자동 삭제 |
| 어드민 | 통계 페이지 + Vercel Analytics + PostHog |

---

## 3. 기술 스택

| 분류 | 선택 | 이유 |
|------|------|------|
| Frontend/Backend | Next.js 15 (App Router) | API routes 통합, 서버/클라이언트 유연성 |
| DB | Supabase (PostgreSQL) | 무료 플랜, Realtime 지원, Edge Function |
| 지도 표시 | Kakao Maps JS SDK | 한국 지도 정확도 |
| 주소 검색 | Kakao Local REST API (keyword/address) | 한국 주소 검색 |
| 장소 추천 | Kakao Local REST API (category) | 카테고리별 장소 검색 |
| 정적 지도 | Kakao Static Map API | 이미지 다운로드용 |
| 길찾기 | Kakao Mobility Directions API | 실이동시간 계산 |
| 배포 | Vercel | Next.js 최적화, 무료 플랜 |
| Analytics | Vercel Analytics + PostHog | 페이지 트래픽 + 이벤트 추적 |

---

## 4. 데이터 모델

### `rooms`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | text | 짧은 고유 ID (예: `abc123`), 공유 링크용 |
| created_at | timestamptz | 생성 시각 |
| expires_at | timestamptz | created_at + 3일, 자동 삭제 기준 |
| max_participants | int | 방장이 설정한 인원수 (1~10) |
| appointment_date | date | 약속 날짜 (선택, null 허용) |
| status | text | `waiting` / `done` |
| midpoint_station_id | text | 최종 선정된 지하철역 카카오 place_id |
| midpoint_lat | float | 최종 중간지점 위도 |
| midpoint_lng | float | 최종 중간지점 경도 |

### `participants`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | |
| room_id | text | rooms.id 참조 |
| nickname | text | 선택 입력, 미입력 시 "참여자 N" (N은 입력 순서) |
| address_name | text | 검색한 주소명 (표시용) |
| lat | float | 위도 |
| lng | float | 경도 |
| joined_at | timestamptz | |

---

## 5. 페이지 구조

```
/                           홈 — 서비스 소개 + 방 만들기
/r/[roomId]                 대기방 — 위치 입력, 참여 현황
/r/[roomId]/result          결과 — 지도, 중간지점, 장소 추천
/admin                      어드민 — 통계 (비밀번호 보호)
```

---

## 6. 사용자 흐름

### 방장
1. 홈에서 인원수(1~10명) + 약속 날짜(선택) 입력 후 방 생성
2. 생성된 짧은 링크(`mideet.com/r/abc123`) 복사해서 공유
3. 대기방에서 본인도 위치 입력 (참여자 1명으로 카운트)
4. 전원 입력 완료 시 자동으로 결과 페이지 이동
5. (예외) 일부 미입력 상태에서도 "지금 결과 보기" 버튼으로 강제 진행 가능 — 최소 2명 이상 입력된 경우에 한함

### 참여자
1. 링크 열면 대기방 진입
2. 닉네임(선택) + 주소 검색으로 위치 입력 후 "입력 완료"
3. 전원 입력 완료 시 자동으로 결과 페이지 이동

### 결과 페이지
- 지도: 중간지점 마커 + 모든 참여자 위치 마커
- 추천 지하철역 및 각 참여자별 예상 이동시간
- 주변 장소 추천 (카테고리 필터: 카페 / 식당 / 술집 / 문화시설 / 쇼핑)
- 장소 목록 하단 고정 문구: "영업시간이 실제와 다를 수 있으니 방문 전 직접 확인해주세요."
- 이미지 다운로드 버튼 (지도 + 추천 장소 PNG)

---

## 7. 중간지점 계산 알고리즘

1. 모든 참여자 위도/경도의 산술 평균으로 초기 중심 좌표 계산
2. 카카오 Local API로 중심 좌표 반경 내 지하철역 최대 10개 추출
3. 카카오 Mobility Directions API로 각 참여자 → 각 후보역 실이동시간 계산
   - 최대 호출 수: 10명 × 10역 = 100회 (방당 1회만 계산, 결과 DB 저장)
4. 각 후보역의 **총 이동시간 합산**이 가장 적은 역을 중간지점으로 선정
5. 결과를 rooms 테이블에 저장 (재계산 방지)
6. (폴백) 중심 좌표 반경 내 지하철역이 없을 경우: 좌표 중심을 그대로 중간지점으로 사용하고, 반경 내 장소만 추천

---

## 8. 실시간 참여 현황

- Supabase Realtime으로 `participants` 테이블 변경 구독
- 대기방에서 새 참여자 입력 시 즉시 목록 업데이트
- 참여 현황: "3 / 5명 입력 완료" 형태로 표시
- 전원 입력 완료 감지 시 → 중간지점 계산 API 호출 → 결과 페이지 자동 이동

---

## 9. 이미지 다운로드

- 카카오 Static Map API로 지도 이미지 생성 (중간지점 + 참여자 마커 포함)
- HTML Canvas로 지도 이미지 + 추천 장소 텍스트 합성
- PNG 파일로 다운로드
- CORS 문제 없이 안정적으로 동작 (html2canvas 미사용)

---

## 10. 데이터 자동 삭제

- Supabase Edge Function + pg_cron으로 매일 자정 실행
- `expires_at < now()` 인 방과 연관 참여자 데이터 삭제

---

## 11. 어드민 페이지 (`/admin`)

- 접근: 환경변수로 관리하는 비밀번호 입력
- 표시 항목:
  - 총 방 생성 수 (전체 / 오늘 / 이번 주)
  - 총 참여자 수
  - 인기 지역 Top 5 (participants.address_name 기준)
  - 일별 방 생성 추이 (최근 30일)
- Vercel Analytics: 페이지별 방문 수 자동 수집
- PostHog 이벤트 트래킹:
  - `room_created` (방 생성)
  - `participant_joined` (참여자 위치 입력)
  - `result_viewed` (결과 페이지 조회)
  - `image_downloaded` (이미지 다운로드)

---

## 12. 제약 및 유의사항

- 카카오 Mobility API는 별도 신청 필요, 무료 할당량 초과 시 과금 발생
- 참여자 10명 제한은 API 호출 비용 통제 목적
- 중간지점은 실제 교통 상황(혼잡도, 막차 등)을 반영하지 않음 — 결과 페이지에 안내 문구 표시
- 약속 날짜는 참고 정보로만 사용, 영업일 필터링 없음
- 방 데이터는 3일 후 삭제됨 — 결과 저장이 필요하면 이미지 다운로드 권장
