## 구현사항

1. 배열
2. get ref element
3. slot
4. 배치 렌더링 16frm
5. async
6. fiber partial 렌더링 (지금은 루트 전체 렌더링)
7. custom element???
8. props
9. 라이프 사이클 mount, unmount, update
10. watch
11. 라우터
12. 전역상태
13. css style colocation
14. ssr, streaming ssr
15. portal
16. 중첩 컴포넌트
17. 렌더 최적화

## 아키텍쳐

사용자가 추상화된 컴포넌트를 쓰는 레이어
|
|
컴포넌트의 렌더 여부, 라이프사이클, diff등 컴포넌트와 dom과의 브릿지 레이어
|
|
실제 그려질 dom 레이어

반응형 데이터 weakmap 으로 관리(vue3 reactivity)
컴포넌트 인스턴스는 weakmap으로 관리
key 생성은 트리 위치를 기준으로 판별