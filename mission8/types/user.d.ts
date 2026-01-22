export interface ProfileResponse {
  user: Omit<User, 'password'>;
  myProducts: {
    list: ProductResponse[];
    totalCount: number;
  };
  myLikedProducts: {
    list: ProductResponse[];
    totalCount: number;
  };
}
