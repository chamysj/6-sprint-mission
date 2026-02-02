import type { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};

/*tsconfig에서 Include로 type경로를 지정해버리면
실행 코드로 인식해버려 소스 코드가 되어버림, 심지어 d.ts 파일인데 import/export 구조 때문에 node가 실제 모듈처럼 취급하고 실행 경로에 영향을 줌.
실제 내가 사용하려고했던 글로벌 타입(확장)선언이 컴파일러 입장에서는 '타입이 아니고 실행모듈이네?'로 인식하게 된다는 것임.
결과적으로 내가 의도한 타입선언이 제대로 이루어지지 않은 것.
그래서 include를 제거하고 typeRoots : "./types" 해당 경로를 통하게 되면, 타입선언 전용으로만 참여하게 됨. => 정상작동*/
