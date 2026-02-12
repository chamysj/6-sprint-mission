"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSyntaxJsonError = isSyntaxJsonError;
function isSyntaxJsonError(err) {
    if (!(err instanceof SyntaxError))
        return false;
    const e = err;
    return typeof e.status === 'number' && 'body' in e;
}
// Partial<SyntaxJsonError>;
// 얘는 SyntaxJsonError의 일부 프로퍼티만 가지고 있을 수도 있어”
// 라고 TS에게 알려서 e.status, e.body 같은 속성 접근을 가능하게 해주는 장치
