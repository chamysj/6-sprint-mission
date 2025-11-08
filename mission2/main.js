import AtcService from './ArticleService.js';
import { Article } from './Article.js';
import { ElectronicProduct } from './ElectronicProduct.js';
import * as ProductService from './ProductService.js';
import { Product } from './product.js';

/*vscode를 실행하고 articleService함수를 호출,제일 처음 node main.js를 터미널에 입력하면 
첫 회는 무조건 에러가 나고 그 다음 2회차부터 정상작동 되던데 왜 그런지 궁금합니다. 아래는 에러 내용 일부입니다.
axios 인스턴스로 url생성 타임아웃 2초가 너무 짧은은 상태에서 json을 파싱하지 못한 상태로 반환된 건가요?
왜 첫 회만 그렇고 2회차부터는 되는건지ㅠ...

getArticleList 실패, 상태 코드: timeout of 2000ms exceeded

node:internal/modules/run_main:123
    triggerUncaughtException(
    ^
AxiosError: timeout of 2000ms exceeded
    at RedirectableRequest.handleRequestTimeout (file:///Users/apple/codeit-mission1/6-sprint-mission/SprintMission2/node_modules/axios/lib/adapters/http.js:675:16)
    at RedirectableRequest.emit (node:events:519:28)
    at Timeout.<anonymous> (/Users/apple/codeit-mission1/6-sprint-mission/SprintMission2/node_modules/follow-redirects/index.js:221:12)
    at listOnTimeout (node:internal/timers:588:17)
    at process.processTimers (node:internal/timers:523:7)
    at Axios.request (file:///Users/apple/codeit-mission1/6-sprint-mission/SprintMission2/node_modules/axios/lib/core/Axios.js:45:41)
    at async file:///Users/apple/codeit-mission1/6-sprint-mission/SprintMission2/main.js:6:17 {
*/
async function atcService() {
  console.log(`-------------GET/ArticleList-------------`);
  const atcList = await AtcService.getArticleList({
    page: null,
    pageSize: null,
    keyword: null,
  });
  console.log(atcList);

  console.log(`-------------GET/Article/id-------------`);
  const atcId = await AtcService.getArticle(`4852`);
  console.log(atcId);

  console.log(`-------------POST/ArticleData-------------`);
  const atcData = {
    title: `제 목`,
    content: `내 용`,
    image: 'https://ex.com',
  };
  const postArticle = await AtcService.createArticle(atcData);
  console.log(postArticle);

  console.log(`-------------PATCH/Article/id-------------`);
  const atcPatch = await AtcService.patchArticle(4852, {
    title: `제 목(수정)`,
  });
  console.log(atcPatch);

  console.log(`-------------DELETE/Article/id-------------`);
  const atcDeleteId = await AtcService.deleteArticle('5084');
  console.log(atcDeleteId);
}
/*저는 이번에 미션 진행하면서 크게 세 가지(클래스,클래스함수,호출부)의 성격을 가진 모듈들이 서로 어떤 관계성을 가지고 상호작용하는지 궁금했는데요.
클래스를 왜만들고 서비스함수를 만들어서 호출부에서 어떻게 다뤄야하는지 잘 이해가 안됐어요. 그래서 멘토링 때 말씀드렸던 
import/export해야할 상황이나 목적에 대해서 헷갈렸던 것 같습니다. 

모범답안을 보니 호출부에서 product클래스만 import해서 활용하고있는데 그 목적을 보면 상품의 종류를 나눠 다루기 위한 것으로
이해됩니다. 반면 article함수 쪽을 확인하면 article 클래스를 활용하고 있지 않고있으면서 export하고있습니다.
이 article클래스가 어떻게 활용될 것인지 왜 export하고 있는지 궁금합니다. product 쪽도 마찬가지겠지만 상품의
종류를 나누는 코드가 없었다면 article 클래스와 마찬가지로 그 모듈이 하는 역할에 대해 궁금했을 것입니다.

단순히 코드만 보면 api를 통해 받아온 정보들을 class에 담아 검증, 캡슐화 등등 정리하고 배열하는 것 같은데 이해하는게 맞는지,
아니라면 어떻게 활용되는 것인지 궁금합니다. 
(article 클래스는 이번 미션 단계에서 활용하지 않지만 다음 미션에서는 활용하기에 export 한 것인지 궁금합니다.)*/

/*prdtsModel 호출부는 학습하다 잘 모르겠는 도중에 모범답안이 나와, 확인 후에 코드 구동 원리를 이해하고자 했습니다.
호출하는 것까지는 어려움이 없었는데, 태그를 통한 상품 분류에서 많이 헤멘 것 같습니다. 상품을 배열로 놓고 순회하는 것,
for문에서 prdt는 단수형 prdts는 복수형같은 네이밍을 해야하는 것, 리터럴을 { list: prdts }로 지정해야하는 것,
이러한 부분들을 놓쳤던 것 같습니다. 이 부분들도 같이 설명해주시면 감사할 것 같습니다.*/

async function prdtsModel() {
  console.log(`-------------GET/Products------------`);
  const { list: prdts } = await ProductService.getProductList({
    page: null,
    pageSize: null,
    keyword: '',
  });
  console.log(prdts);
  const prdtList = [];
  for (const prdt of prdts) {
    let product;
    if (prdt.tags.includes('전자제품')) {
      product = new ElectronicProduct(prdt);
    } else {
      product = new Product(prdt);
    }
    prdtList.push(product);
  }
  console.log(prdtList);
}

async function prdtService() {
  console.log(`-------------GET/ProductList-------------`);
  const prdtList = await ProductService.getProductList({
    page: null,
    pageSize: null,
    keyword: '',
  });
  console.log(prdtList);

  console.log(`-------------GET/Product/id-------------`);
  const prdtid = await ProductService.getProduct('2571');
  console.log(prdtid);

  console.log(`-------------POST/Product/Data-------------`);
  const prdtPost = await ProductService.createProduct({
    name: '스피커',
    description: '택배비 무료',
    price: 40000,
    tags: '전자제품',
    images: 'https://example.com',
  });
  console.log(prdtPost);

  console.log(`-------------PATCH/Product/Data-------------`);
  const prdtPatch = await ProductService.patchProduct(2589, {
    name: '스피커',
    description: '택배비 유료',
    price: 43000,
    tags: '전자제품',
    images: 'https://example.com',
  });
  console.log(prdtPatch);

  console.log(`-------------DELETE/Product/Data-------------`);
  const prdtDelete = await ProductService.deleteProduct(2622);
  console.log(prdtDelete);
}
/* 모범 답안에서 호출부를 단순화하는 것 같아 보고 활용했습니다. */
async function test() {
  await atcService();
  await prdtsModel();
  await prdtService();
}

test();
