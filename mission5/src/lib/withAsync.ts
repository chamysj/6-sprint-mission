import type { Request, Response, NextFunction, RequestHandler } from 'express';

export function withAsync<T = unknown>(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<T>,
): RequestHandler {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

/*
제네릭의 역할 : 타입을 함수처럼 외부에서 주입해서 재사용성 확보

제네릭은 타입을 미리 결정하지 않고 외부에서 주입해서
재사용성을 극대화하는 타입 설계 기법

function wrap<T>(value: T): T {
  return value;
}

const a = wrap(1);          // T = number → a: number
const b = wrap("hi");       // T = string → b: string
const c = wrap({ id: 1 });  // T = { id: number } → c도 같은 타입

미션4/5 코드 보면 컨트롤러는 거의 다 이런 패턴
export async function getArticle(req, res) {
  ...
  return res.send(...);
}
실제로는 res.send() 하고 끝
withAsync가 그 리턴값을 가지고 뭔가 하는 건 아님
실무에서는 단순하게 위처럼 void를 많이 씀
제네릭 아예 안 씀
“컨트롤러는 Promise<void>를 리턴한다”로 통일
실용적이고, 이해도 쉽고, 미션에도 충분히 적합
지금 단계에서 제네릭이 꼭 필요해서 썼다기보단, 
“타입을 좀 더 유연하게, 확장 가능하게 만들기 위한 옵션” 정도로 이해하면 됨.

그럼 “언제부터 제네릭을 의식적으로 쓰면 좋냐?”
똑같은 로직을 여러 모델에 쓰고 싶을 때
예: 공통 getList<T> 서비스, 공통 Repository<T> 등
페이지네이션, 응답 포맷, 래핑 함수 등 “틀”을 만들 때
Paginated<T>
ApiResponse<T>
withAsync<T>
wrapResult<T>
“any”를 쓰고 싶은데, 타입을 잃고 싶지는 않을 때
any는 타입을 완전히 포기하는 느낌이고,
제네릭은 “타입은 유동적이지만, 쓰는 쪽에서 정할 수 있게 열어두는 것”

제네릭을 써야 하는 상황
→ “로직은 공통인데, 타입은 바뀌는 경우” + “그 타입을 안전하게 유지하고 싶을 때”

void
"아무 것도 반환하지 않음"
Promise<void>
"비동기 함수지만 반환값 없음"
withAsync에서 Promise<void>를 쓰는 이유
컨트롤러는 결과를 return 하지 않고 res.send() 로 응답을 끝내기 때문
Express 컨트롤러는 return value를 사용하지 않는다
그래서 굳이 제네릭 T를 쓰지 않고 Promise<void>로 고정하는 게 일반적
*/
