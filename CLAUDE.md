# AcneScan Project Guide

## 기술 스택
- Frontend/Backend: SvelteKit (TypeScript)
- Styling: Tailwind CSS
- Database: PostgreSQL 17 (Docker Compose)
- Infra: Docker, Docker Compose

## 개발 규칙
- 모든 파일은 TypeScript를 사용한다.
- UI는 Tailwind CSS를 사용하여 현대적이고 깔끔하게 디자인한다.
- 컴포넌트는 `src/lib/components`에 위치시킨다.
- 권한 문제가 발생하지 않도록 파일 생성 후 소유권을 확인한다.

## 주요 명령어
- 개발 서버 실행: `pnpm run dev`
- 도커 실행: `docker compose -f compose.dev.yml up -d`
- 의존성 설치: `pnpm install`
- 패키지 추가: `pnpm add <package-name>`