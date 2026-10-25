# DDS — 창조과학 지식 커뮤니티

Figma Make `DDS_최종` 디자인을 옮긴 React 프로젝트.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # dist/index.html 단일 파일로 빌드
```

## 구조

```
src/
  main.tsx            진입점
  app/App.tsx         전체 화면·컴포넌트·목업 데이터
  styles/
    index.css         Pretendard 폰트, 전역 스타일
    theme.css         디자인 토큰 (Figma Make theme 그대로)
scripts/finalize.mjs  빌드 결과의 외부 이미지를 data URI로 내장 (선택)
```

## 참고

- 스택: Vite 6 · React 18 · Tailwind CSS v4 · lucide-react
- 테스트 계정: `admin / admin1234` (관리자), `user1 / user1234` (일반)
- 데이터는 전부 `App.tsx` 안의 목업이라 새로고침하면 초기화됨
- `vite-plugin-singlefile`로 JS·CSS·폰트를 HTML 하나에 묶음. 일반 빌드(파일 분리)를 원하면 `vite.config.mts`에서 `viteSingleFile()`을 빼면 됨
