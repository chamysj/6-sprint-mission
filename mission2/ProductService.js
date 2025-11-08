export async function getProductList(params = {}) {
  try {
    const url = new URL('https://panda-market-api-crud.vercel.app/products');
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value == null) return;
      url.searchParams.append(key, params[key]);
    });
    const res = await fetch(url);
    if (!res.ok) {
      const err = new Error(`서버 응답 오류, 상태 코드:${res.status}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('getProductList 호출 실패', error);
    throw error;
  }
}

export async function getProduct(id) {
  try {
    if (id == null) {
      throw new Error(`조회할 id를 입력하세요.`);
    }
    const url = new URL(
      `https://panda-market-api-crud.vercel.app/products/${id}`
    );
    const res = await fetch(url);
    if (!res.ok) {
      const err = new Error(`서버 응답 오류, 상태 코드:${res.status}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`getProduct id 호출 실패`, error);
    throw error;
  }
}

export async function createProduct(postData = {}) {
  try {
    const url = new URL(`https://panda-market-api-crud.vercel.app/products`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    if (!res.ok) {
      const err = new Error(`서버 응답 오류, 상태코드:${res.status}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`createProduct 호출 실패`, error);
    throw error;
  }
}

export async function patchProduct(id, patchData = {}) {
  try {
    if (id == null) {
      throw new Error(`수정할 id를 입력하세요`);
    }
    const url = new URL(
      `https://panda-market-api-crud.vercel.app/products/${id}`
    );
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchData),
    });
    if (!res.ok) {
      const err = new Error(`서버 응답 오류, 상태코드:${res.status}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`patchProduct 호출 실패`, error);
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    if (id == null) {
      throw new Error(`삭제할 id를 입력하세요.`);
    }
    const url = new URL(
      `https://panda-market-api-crud.vercel.app/products/${id}`
    );
    const res = await fetch(url, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = new Error(`서버 응답 오류, 상태코드:${res.status}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    console.log('[삭제 성공]');
    return data;
  } catch (error) {
    console.error(`deleteProduct 호출 실패`, error);
    throw error;
  }
}
