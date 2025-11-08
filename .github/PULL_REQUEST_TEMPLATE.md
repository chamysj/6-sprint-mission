# 요구사항

### 클래스 구현하기

- [x] class 키워드를 이용해서 Product 클래스와 ElectronicProduct 클래스를 만들어 주세요.
  - [x] Product 클래스는 name(상품명) description(상품 설명), price(판매 가격), tags(해시태그 배열), images(이미지 배열),
        favoriteCount (찜하기 수)프로퍼티를 가집니다.
  - [x] Product 클래스는 favorite 메소드를 가집니다. favorite 메소드가 호출될 경우 찜하기 수가 1 증가합니다.
  - [x] ElectronicProduct 클래스는 Product를 상속하며, 추가로 manufacturer(제조사) 프로퍼티를 가집니다.
- [x] class 키워드를 이용해서 Article 클래스를 만들어 주세요.
  - [x] Article 클래스는 title(제목), content(내용), writer(작성자), likeCount(좋아요 수) 프로퍼티를 가집니다.
  - [x] Article 클래스는 like 메소드를 가집니다. like 메소드가 호출될 경우 좋아요 수가 1 증가합니다.
  - [x] 각 클래스 마다 constructor를 작성해 주세요.
  - [x] 추상화/캡슐화/상속/다형성을 고려하여 코드를 작성해 주세요.

### Article 요청 함수 구현하기

- [x] https://panda-market-api-crud.vercel.app/docs 의 Article API를 이용하여 아래 함수들을 구현해 주세요.
  - [x] getArticleList() : GET 메소드를 사용해 주세요.
    - [x] page, pageSize, keyword 쿼리 파라미터를 이용해 주세요.
  - [x] getArticle() : GET 메소드를 사용해 주세요.
  - [x] createArticle() : POST 메소드를 사용해 주세요.
    - [x] request body에 title, content, image 를 포함해 주세요.
  - [x] patchArticle() : PATCH 메소드를 사용해 주세요.
  - [x] deleteArticle() : DELETE 메소드를 사용해 주세요.
- [x] fetch 혹은 axios를 이용해 주세요.
  - [x] 응답의 상태 코드가 2XX가 아닐 경우, 에러 메시지를 콘솔에 출력해 주세요.
- [x] .then() 메소드를 이용하여 비동기 처리를 해주세요.
- [x] .catch() 를 이용하여 오류 처리를 해주세요.

### Product 요청 함수 구현하기

- [x] https://panda-market-api-crud.vercel.app/docs 의 Product API를 이용하여 아래 함수들을 구현해 주세요.
  - [x] getProductList() : GET 메소드를 사용해 주세요.
    - [x] page, pageSize, keyword 쿼리 파라미터를 이용해 주세요.
  - [x] getProduct() : GET 메소드를 사용해 주세요.
  - [x] createProduct() : POST 메소드를 사용해 주세요.
    - [x] request body에 name, description, price, tags, images 를 포함해 주세요.
  - [x] patchProduct() : PATCH 메소드를 사용해 주세요.
  - [x] deleteProduct() : DELETE 메소드를 사용해 주세요.
- [x] async/await 을 이용하여 비동기 처리를 해주세요.
- [x] try/catch 를 이용하여 오류 처리를 해주세요.
- [x] getProductList()를 통해서 받아온 상품 리스트를 각각 인스턴스로 만들어 products 배열에 저장해 주세요.
  - [x] 해시태그에 "전자제품"이 포함되어 있는 상품들은 Product 클래스 대신 ElectronicProduct 클래스를 사용해 인스턴스를 생성해 주세요.
  - [x] 나머지 상품들은 모두 Product 클래스를 사용해 인스턴스를 생성해 주세요.
- [x] 구현한 함수들을 아래와 같이 파일을 분리해 주세요.
  - [x] export를 활용해 주세요.
  - [x] ProductService.js 파일 Product API 관련 함수들을 작성해 주세요.
  - [x] ArticleService.js 파일에 Article API 관련 함수들을 작성해 주세요.
- [x] 이외의 코드들은 모두 main.js 파일에 작성해 주세요.
  - [x] import를 활용해 주세요.
  - [x] 각 함수를 실행하는 코드를 작성하고, 제대로 동작하는지 확인해 주세요.

### (심화)Article 요청 함수 구현하기

- [x] Article 클래스에 createdAt(생성일자) 프로퍼티를 만들어 주세요.
  - [x] 새로운 객체가 생성되어 constructor가 호출될 시 createdAt에 현재 시간을 저장합니다

---

## Git과 Github 활용하기

- [x] README.md 파일을 작성해 주세요
  - [x] 마크다운 언어를 숙지하여 작성해 주세요.
  - [x] 내용은 자유롭게 작성해 주세요.
- [x] 본인 브랜치(ex)홍길동)에 스프린트 미션을 업로드 해 주세요.
- [x] 적절한 커밋 메시지를 남겨 주세요.
- [x] N-Sprint-Mission 레포지토리를 fork 합니다. (e.g. 2기면 2-Sprint-Mission)
- [x] GitHub에 PR(Pull Request)을 생성해 upstream의 본인 브랜치(ex)홍길동)에 미션을 제출합니다.
- [x] PR 커멘트에 아래 내용들을 포함해 주세요.
  - [x] 스프린트 미션 요구사항 체크리스트
    - [x] 체크리스트(- [ ]) 를 만듭니다.
    - [x] 완료한 만큼 체크 표시 (- [x]) 를 해 주세요.

---

## 주요 변경사항

- Article 요청 함수는 axios를 활용해 만들었습니다.
- 코드를 작성하면서 잘 모르겠는 부분이나, 모범 답안을 참고하여 작성한 코드는 주석 처리하여 표기했습니다.
- 계속 코드를 수정하며 완료된 부분, 정돈된 부분들은 주석을 삭제하겠습니다.

---

## 스크린샷

### ![alt text](<스크린샷 2025-10-17 오후 1.34.51.png>)

### ![alt text](<스크린샷 2025-10-17 오후 1.35.25.png>)

### ![alt text](<스크린샷 2025-10-17 오후 1.36.25-1.png>)

---

## 멘토에게

- 코드 작성하면서 잘 몰랐던 부분들이나 이해가 필요한 부분 등등, 특이사항은 주석처리하여 작성했습니다. 감사합니다.
