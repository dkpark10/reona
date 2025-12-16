## 구현사항

1. 배열
2. get ref element
3. slot
4. 배치 렌더링 16frm
5. async
6. fiber partial 렌더링
7. custom element???
8. props
9. 라이프 사이클 mount, unmount, update
10. watch
11. 라우터
12. 전역상태
13. css style colocation
14. ssr, streaming ssr

## 아키텍쳐

사용자가 추상화된 컴포넌트를 쓰는 레이어
|
|
컴포넌트의 렌더 여부, 라이프사이클, diff등 컴포넌트와 dom과의 브릿지 레이어
|
|
실제 그려질 dom 레이어
