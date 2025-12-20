/*
  다음 경우들에 대해 총 14개의 SQL 쿼리를 작성해 주세요.
  예시로 값이 필요한 경우 적당한 값으로 채워넣어서 작성하면 됩니다. 
*/

/*
  1. 내 정보 업데이트 하기
  - 닉네임을 "test"로 업데이트
  - 현재 로그인한 유저 id가 1이라고 가정
*/

update users
set nickname = 'test', updated_at = now()
where id = 1;

/*
  2. 내가 생성한 상품 조회
  - 현재 로그인한 유저 id가 1이라고 가정
  - 최신 순으로 정렬
  - 10개씩 페이지네이션, 3번째 페이지
*/

select *
from products
where user_id = 1
order by created_at desc
limit 10 offset (3 - 1) * 10;

/*
  3. 내가 생성한 상품의 총 개수
  - 현재 로그인한 유저 id가 1이라고 가정
*/
--count(user_id)로 작성해도 스키마 상 not null이기 때문에 값은 같지만 
--나중에 컬럼이 nullable로 바뀌거나할 경우 join으로 컬럼이 null이 섞여도 의미가 흔들리지 않아서 * 권장

select count(*)  
from products
where user_id = 1;

/*
  4. 내가 좋아요 누른 상품 조회
  - 현재 로그인한 유저 id가 1이라고 가정
  - 최신 순으로 정렬
  - 10개씩 페이지네이션, 3번째 페이지
*/

select products.name as "like_product_name",
products.description,
products.price,
products.tags,
products.images,
products.created_at,
likes.created_at as "like_created_at"
from products join likes
on products.id = likes.product_id
where likes.user_id = 1 and likes.product_id is not null
order by likes.created_at desc
limit 10 offset (3 -1) * 10;

/*
  5. 내가 좋아요 누른 상품의 총 개수
  - 현재 로그인한 유저 id가 1이라고 가정
*/

select user_id, count(*) as total_count
from likes
where user_id = 1
group by user_id;

/*
  6. 상품 생성
  - 현재 로그인한 유저 id가 1이라고 가정
*/

select setval('products_id_seq', coalesce((select max(id) from products), 1));--데이터가 하나도 없으면 null이니 안전하게 coalesce사용

insert into products (name, description, price, tags, images, user_id) 
values ('test','test description', 50000, array['태그1','태그2'], array['이미지1','이미지2'], 1);

/*
  7. 상품 목록 조회
  - 상품명에 "test"가 포함된 상품 검색
  - 최신 순으로 정렬
  - 10개씩 페이지네이션, 1번째 페이지
  - 각 상품의 좋아요 개수를 포함해서 조회하기
*/

select products.*, coalesce(like_counts.like_count, 0) as like_count
from products left join
(select product_id, count(*) as like_count
from likes
where product_id is not null --좋아요 한개로 상품과 게시글을 운용하니까, 게시글이 좋아요인 경우는 null이니 is not null로 상품 좋아요를 찾아주는 것
group by product_id) as like_counts
on products.id = like_counts.product_id
where products.name like '%test%'
order by products.created_at desc
limit 10 offset (1 - 1) * 10;

/*
  8. 상품 상세 조회
  - 1번 상품 조회
*/

select *
from products
where products.id = 1;

/*
  9. 상품 정보 수정
  - 1번 상품 수정
*/

update products
set
name = '수정한 이름',
description = '수정한 내용',
updated_at = now()
where id = 1;

/*
  10. 상품 삭제
  - 1번 상품 삭제
*/

delete from products
where id = 1;

/*
  11. 상품 좋아요
  - 1번 유저가 2번 상품 좋아요
*/
select setval('likes_id_seq', coalesce((select max(id) from likes), 1));--여기도 안전하게 coalesce사용

insert into likes(user_id, product_id)
values(1, 2)
on conflict(user_id, product_id) do nothing;--이미 좋아요 눌렸을 시 아무일도 일어나지 않게

/*
  12. 상품 좋아요 취소
  - 1번 유저가 2번 상품 좋아요 취소
*/

delete from likes
where user_id = 1
and product_id = 2;

/*
  13. 상품 댓글 작성
  - 1번 유저가 2번 상품에 댓글 작성
*/

insert into comments(content, product_id, user_id)
values('댓글 작성', 2, 1);


/*
  14. 상품 댓글 조회
  - 1번 상품에 달린 댓글 목록 조회
  - 최신 순으로 정렬
  - 댓글 날짜 2025-03-25 기준일을 제외한 이전 데이터 10개
*/

select *
from comments
where product_id = 1 and created_at < '2025-03-25 00:00:00+09'--timestamptz 사용하기 때문에 한국 기준 +09해야한다고 함
order by created_at desc 
limit 10;


