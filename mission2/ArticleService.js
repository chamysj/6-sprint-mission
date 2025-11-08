import axios from 'axios';
//미션 요구 사항에 fetch나 axios를 이용해 작성하라고 나와있어서 article service는 axios를 product service는 fetch를 이용했습니다.
const AtcService = {
  getArticleList,
  getArticle,
  createArticle,
  patchArticle,
  deleteArticle,
};
export default atcService; //article을 줄여서 atc로 표기해봤는데 생각해보니 나만 아는 표기법인 것 같아 '좀 더 직관적이게 작성해야 했나?' 생각됩니다.

const instance = axios.create({
  baseURL: 'https://panda-market-api-crud.vercel.app',
  timeout: 2000,
});

function getArticleList(queryParams = {}) {
  if (queryParams == null)
    return Promise.reject(new Error('쿼리 값을 입력하세요.')); //코드를 다시 확인하다보니, 에러 메세지에 쿼리 값을 입력하라는 게 적절한 표현인지 잘 모르겠습니다.
  return instance
    .get('/articles', { params: queryParams })
    .then((res) => res.data)
    .catch((err) => {
      console.error(
        `getArticleList 실패, 상태 코드:`, //서버 응답이 있는지 없는지, 있는데 에러가 났다면 어떤 상태인지 알기 위해 상태코드를 따로 출력하도록 했습니다.
        err.response?.status ?? err.message //옵셔널 체이닝과, 널 병합 연산자는 ai로 학습하면서 알게됐는데 ES2020에 추가된 문법이라고 하는데, 실무에서 많이 쓰이는지 궁금합니다.
      );
      throw err;
    });
}

/*저는 주로 ai와 lms강의 통해 학습했는데, id가 비어있는 상태일 때만 에러메세지가 나오도록 코드를 구성했습니다. ai는 id가 비어있을 때에만 리젝트하기에 비교적 약한 검증이다.
문자열인지 아닌지 등등 비교적 강한 검증?이 필요하다고 했습니다. 만약 실무라면 검증 단계에서 지금보다는 좀 더 빡빡한 검증을 필요로 하나요? 아직 경험이 없어서 그런지..에러가 날만한
상황들을 생각하지 못했기에 생각이 '아 문자열이 아닌 걸 입력할 수 도 있겠구나'라는 단계까지 가지 못했습니다. 이런 에러가 날 변수들에 대해서는 미연에 방지할 수 있는 것들은
최대한 방지하고 후에 디버깅하며 코드를 고쳐나가는 것이 문제 해결 능력을 기르는 데 최선인가요?, 아니면 당연한 것인데 아직 익숙치 않아서 그런 것인가요ㅠ*/
function getArticle(id) {
  if (id == null) return Promise.reject(new Error('조회할 id를 입력하세요.'));
  return instance
    .get(`/articles/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(
        `getArticle(id) 실패, 상태 코드:`,
        err.response?.status ?? err.message
      );
      throw err;
    });
}

function createArticle(articleData) {
  return instance
    .post('/articles', articleData)
    .then((res) => res.data)
    .catch((err) => {
      console.log(
        `createArticle 실패, 상태 코드:`,
        err.response?.status ?? err.message
      );
      throw err;
    });
}

function patchArticle(id, patchData) {
  if (id == null) return Promise.reject(new Error('수정할 id를 입력하세요.'));
  return instance
    .patch(`/articles/${id}`, patchData)
    .then((res) => res.data)
    .catch((err) => {
      console.log(
        `patchArticle 실패, 상태 코드:`,
        err.response?.status ?? err.message
      );
      throw err;
    });
}

function deleteArticle(id) {
  if (id == null) return Promise.reject(new Error('삭제할 id를 입력하세요.'));
  return instance
    .delete(`/articles/${id}`)
    .then((res) => {
      console.log('삭제 성공, 상태 코드:', res.status);
      return res.data;
    })
    .catch((err) => {
      console.log(
        `deleteArticle 실패, 상태 코드:`,
        err.response?.status ?? err.message
      );
      throw err;
    });
}
