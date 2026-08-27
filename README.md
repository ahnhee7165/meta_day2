# 메타 · 구글 광고 영업 케이스 플레이북

SEM 신입 세일즈 교육용 정적 웹사이트입니다. 빌드 과정 없이 순수 HTML/CSS/JS로 되어 있어 그대로 GitHub에 올리면 됩니다.

## 구성

```
├── index.html   # 전체 페이지 (메타 영업 · 지표 용어 · 케이스 뱅크 · 구글 영업 · Q&A)
├── style.css    # 스타일시트
├── script.js    # 사이드바 토글 + 스크롤 하이라이트
└── README.md
```

## GitHub에 올리는 방법

1. GitHub에서 새 저장소를 만듭니다 (예: `sales-playbook`).
2. 이 폴더 안의 파일들을 그대로 저장소에 업로드합니다.
   - 웹에서: 저장소 페이지 → **Add file → Upload files** → 이 폴더의 파일 4개를 드래그
   - 터미널에서:
     ```bash
     cd sales-playbook
     git init
     git add .
     git commit -m "메타/구글 영업 케이스 플레이북"
     git branch -M main
     git remote add origin https://github.com/{계정명}/{저장소명}.git
     git push -u origin main
     ```

## GitHub Pages로 바로 배포하기 (선택)

팀원들이 링크 하나로 볼 수 있게 하려면:

1. 저장소 → **Settings → Pages**
2. **Source**를 `Deploy from a branch`로 설정
3. Branch를 `main` / `/(root)`로 지정 후 저장
4. 몇 분 뒤 `https://{계정명}.github.io/{저장소명}/` 에서 접속 가능

## 내용 수정하기

- 텍스트/스크립트 내용은 `index.html`의 각 `<section>` 블록 안에서 직접 수정하면 됩니다.
- 챕터별 색상은 `style.css` 상단 `:root` 변수(`--meta`, `--metric`, `--bank`, `--google`)에서 관리합니다.
- 새 케이스를 추가하려면 `bank-cases` 섹션의 `<details class="case">…</details>` 블록을 복사해서 늘리면 됩니다.

## 원본 출처

기존 사내 교육 PPT(`영업케이스_메타_구글_.pptx`)의 콘텐츠 영업 · 협력광고 · 권한부여 프로세스 · 구글 AEO/PMax/쇼핑 영업 내용을 웹 페이지로 재구성하고, 핵심 지표 용어 챕터와 추가 실습 케이스 뱅크(6종)를 새로 추가했습니다.
