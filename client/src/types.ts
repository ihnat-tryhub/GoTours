export type Difficulty = 'easy' | 'medium' | 'difficult';

export type User = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  photo?: string;
  role?: 'user' | 'guide' | 'lead-guide' | 'admin';
};

export type TourLocation = {
  type?: string;
  coordinates?: number[];
  address?: string;
  description?: string;
  day?: number;
};

export type Review = {
  _id: string;
  id?: string;
  review: string;
  rating: number;
  user?: User;
};

export type Tour = {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  duration: number;
  maxGroupSize: number;
  difficulty: Difficulty;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images: string[];
  startDates: string[];
  startLocation?: TourLocation;
  locations?: TourLocation[];
  guides?: User[];
  reviews?: Review[];
};

export type Booking = {
  _id: string;
  id?: string;
  tour: Tour | string;
  user?: User | string;
  price: number;
  paid?: boolean;
  createdAt: string;
};

export type AuthResponse = {
  status: string;
  token: string;
  data: {
    user: User;
  };
};

export type ApiCollectionResponse<T> = {
  status: string;
  results?: number;
  result?: number;
  data: {
    data: T[];
  };
};

export type ApiSingleResponse<T> = {
  status: string;
  data: {
    doc?: T;
    data?: T;
    user?: T;
  };
};

export type CheckoutSessionResponse = {
  status: string;
  session: {
    id: string;
    url?: string;
  };
};
