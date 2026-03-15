export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() ?? null;
  }
  return null;
};

const ensureCsrfToken = async () => {
  const token = getCookie("csrftoken");
  if (token) {
    return token;
  }

  await fetch(`${API_BASE_URL}/csrf/`, {
    method: "GET",
    credentials: "include",
  });

  return getCookie("csrftoken");
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const method = (init.method ?? "GET").toUpperCase();
  const isJsonBody = init.body !== undefined && !(init.body instanceof FormData);

  const headers = new Headers(init.headers ?? {});
  if (isJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRFToken", csrfToken);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method,
    credentials: "include",
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;
    const message =
      typeof data?.error === "string"
        ? data.error
        : typeof data?.detail === "string"
          ? data.detail
          : fallbackMessage;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
};

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface DashboardStats {
  total_forms: number;
  total_responses: number;
  active_forms: number;
}

export interface FormListItem {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  response_count: number;
}

export interface OptionData {
  id: number;
  text: string;
  score: number;
}

export interface QuestionData {
  id: number;
  title: string;
  answer_type: string;
  required: boolean;
  order: number;
  reverse_scored?: boolean;
  construct?: string;
  options: OptionData[];
}

export interface FormDetail {
  id: number;
  title: string;
  description: string;
  require_email: boolean;
  is_active?: boolean;
  is_anonymous?: boolean;
  created_at?: string;
  updated_at?: string;
  questions: QuestionData[];
}

export interface ResultsData {
  total_responses: number;
  construct_averages: Record<string, number>;
}

export interface TemplateQuestion {
  title: string;
  answer_type: string;
  required: boolean;
}

export interface TemplateData {
  id: string;
  category: string;
  name: string;
  question_count: number;
  questions: TemplateQuestion[];
}

export const authApi = {
  me: () => request<User>("/me/"),
  login: (payload: LoginPayload) => request<{ user: User }>("/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  signup: (payload: SignupPayload) => request<{ message: string }>("/signup/", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  logout: () => request<void>("/logout/", { method: "POST" }),
};

export const dashboardApi = {
  stats: () => request<DashboardStats>("/dashboard/"),
  listForms: () => request<FormListItem[]>("/dashboard/forms/"),
  createForm: (payload: { title: string; description?: string }) =>
    request<{ id: number }>("/dashboard/forms/create/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getForm: (id: number) => request<FormDetail>(`/dashboard/forms/${id}/edit/`),
  deleteForm: (id: number) => request<void>(`/dashboard/forms/${id}/delete/`, { method: "DELETE" }),
  addQuestion: (formId: number, payload: { title: string; answer_type: string; required?: boolean }) =>
    request<QuestionData>(`/dashboard/forms/${formId}/questions/add/`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  addOption: (questionId: number, payload: { text: string; score?: number }) =>
    request<OptionData>(`/dashboard/questions/${questionId}/options/add/`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  shortenUrl: (formId: number) => request<{ short_code: string }>(`/dashboard/forms/${formId}/shorten/`, { method: "POST" }),
  getTemplates: () => request<TemplateData[]>("/templates/"),
};

export const formApi = {
  get: (formId: number) => request<FormDetail>(`/forms/${formId}/`),
  submit: (formId: number, payload: { email?: string; answers: Array<{ question_id: number; value: unknown }> }) =>
    request<{ message: string }>(`/forms/${formId}/submit/`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  results: (formId: number) => request<ResultsData>(`/forms/${formId}/results/`),
};
