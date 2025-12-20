--oauth 기능 구현 시 필요한 테이블 추가

create type oauth_provider as ENUM ('GOOGLE', 'KAKAO');

create table users (
  id serial primary key,
  email text not null unique,
  nickname text not null unique,
  image text,
  password text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table articles (
  id serial primary key,
  title text not null,
  content text not null,
  image text,
  user_id int not null references users(id), 
  created_at timestamptz not null default now(), 
  updated_at timestamptz not null default now()
);

create table products (
  id serial primary key,
  name text not null, 
  description text not null,
  price int not null,
  tags text[] not null default '{}', 
  images text[] not null default '{}',
  user_id int not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table comments (
  id serial primary key,
  content text not null,
  product_id int references products(id) on delete cascade,
  article_id int references articles(id) on delete cascade,
  user_id int not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_target_check check (
    (product_id is not null and article_id is null)
    or
    (product_id is null and article_id is not null)
  )
);

create table likes (
  id serial primary key,
  user_id int not null references users(id),
  product_id int references products(id) on delete cascade,
  article_id int references articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint likes_target_check check (
    (product_id is not null and article_id is null)
    OR
    (product_id is null and article_id is not null)
  ),
  constraint likes_product unique (user_id, product_id),
  constraint likes_article unique (user_id, article_id)
);

create table oauth_accounts (
  id serial primary key,
  provider oauth_provider not null,
  provider_account_id text not null,
  user_id int not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint oauth_provider_account_unique unique (provider, provider_account_id)
);

-- refresh 토큰 서버관리 + 로테이션
create table sessions (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  refresh_token_hash text not null,--토큰 해시 저장
  jti text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  user_agent text,
  ip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
