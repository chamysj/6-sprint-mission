export class Article {
  //좋아요 수, 생성일자 캡슐화
  #likeCount = 0;
  #createdAt;

  constructor({ title, content, writer, likeCount = 0 }) {
    this.title = title; //제목
    this.content = content; //내용
    this.writer = writer; //작성자
    this.#likeCount = likeCount; //좋아요 수
    this.#createdAt = new Date(); //생성 일자
  }
  //좋아요 수 증가
  like() {
    this.#likeCount += 1;
  }
  getlikeCount() {
    return this.#likeCount;
  }
  getcreatedAt() {
    return this.#createdAt;
  }
}
