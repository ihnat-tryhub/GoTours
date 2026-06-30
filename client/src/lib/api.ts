import type {
  ApiCollectionResponse,
  ApiSingleResponse,
  AuthResponse,
  Booking,
  CheckoutSessionResponse,
  Tour,
  User,
} from '../types';
import { normalizeApiErrorMessage } from './errors';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? '';
const TOKEN_STORAGE_KEY = 'gotours_token';

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly rawMessage?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function assetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}

function isFormDataBody(body: BodyInit | null | undefined): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function extractErrorMessage(payload: unknown, status: number): string {
  if (!payload || typeof payload !== 'object') {
    return `Request failed with status ${status}`;
  }

  const responsePayload = payload as {
    message?: unknown;
    error?: unknown | { message?: unknown };
  };

  const errorPayload = responsePayload.error;
  const rawMessage =
    responsePayload.message ??
    (typeof errorPayload === 'object' && errorPayload !== null && 'message' in errorPayload
      ? errorPayload.message
      : undefined);

  if (typeof rawMessage === 'string') return rawMessage;
  if (Array.isArray(rawMessage)) return rawMessage.map(String).join(' ');

  return `Request failed with status ${status}`;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type') && !isFormDataBody(options.body)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false) {
    const token = getStoredToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_ORIGIN}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : undefined;
    throw new ApiError(normalizeApiErrorMessage(rawMessage), undefined, rawMessage);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const rawMessage = extractErrorMessage(payload, response.status);
    const message = normalizeApiErrorMessage(rawMessage, response.status);
    throw new ApiError(message, response.status, rawMessage);
  }

  return payload as T;
}

function unwrapSingle<T>(response: ApiSingleResponse<T>): T {
  const item = response.data.doc ?? response.data.data ?? response.data.user;
  if (!item) {
    throw new ApiError('The old API returned an unexpected response shape.');
  }
  return item;
}

function tourId(tour: Tour): string {
  return tour.id ?? tour._id;
}

function isMongoId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

export async function getTours(): Promise<Tour[]> {
  const response = await request<ApiCollectionResponse<Tour>>('/api/v1/tours', {
    auth: false,
  });
  return response.data.data;
}

export async function getTourById(id: string): Promise<Tour> {
  const response = await request<ApiSingleResponse<Tour>>(`/api/v1/tours/${id}`, {
    auth: false,
  });
  return unwrapSingle(response);
}

export async function getTourBySlugOrId(value: string): Promise<Tour> {
  if (isMongoId(value)) {
    return getTourById(value);
  }

  const tours = await getTours();
  const found = tours.find((tour) => tour.slug === value || tourId(tour) === value);

  if (!found) {
    throw new ApiError('Tour not found.', 404);
  }

  return getTourById(tourId(found));
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/v1/users/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(input: {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/api/v1/users/signup', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(input),
  });
}

export async function logout(): Promise<void> {
  await request('/api/v1/users/logout', { auth: false });
}

export async function getCurrentUser(): Promise<User> {
  const response = await request<ApiSingleResponse<User>>('/api/v1/users/me');
  return unwrapSingle(response);
}

export async function updateCurrentUser(input: {
  name: string;
  email: string;
}): Promise<User> {
  const response = await request<ApiSingleResponse<User>>('/api/v1/users/updateMe', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return unwrapSingle(response);
}

export async function updateCurrentUserPhoto(photo: File): Promise<User> {
  const formData = new FormData();
  formData.append('photo', photo);

  const response = await request<ApiSingleResponse<User>>('/api/v1/users/updateMe', {
    method: 'PATCH',
    body: formData,
  });
  return unwrapSingle(response);
}

export async function createCheckoutSession(tourIdValue: string): Promise<CheckoutSessionResponse> {
  return request<CheckoutSessionResponse>(`/api/v1/bookings/checkout-session/${tourIdValue}`);
}

export async function getMyBookings(): Promise<Booking[]> {
  const response = await request<ApiCollectionResponse<Booking>>('/api/v1/bookings/me');
  return response.data.data;
}
