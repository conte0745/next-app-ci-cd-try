export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  isDeleted?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface TodoCreateRequest {
  title: string;
}

export interface TodoUpdateRequest {
  id: number;
  completed: boolean;
}

export interface TodoDeleteRequest {
  id: number;
}
