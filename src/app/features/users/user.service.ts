import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_LIST, apiUrl } from '../../core/models/api-list.model';
import { APP_CONFIG } from '../../core/models/app-config.model';
import { ManagedUser, ResetPasswordRequest, UpdateUserRequest } from './user.model';

interface ApiUser {
  readonly id: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly name?: string;
  readonly email?: string;
  readonly active?: boolean;
  readonly isActive?: boolean;
  readonly roles?: readonly string[];
  readonly role?: string;
  readonly createdAt?: string;
}

interface ApiUserList {
  readonly users?: readonly ApiUser[];
  readonly items?: readonly ApiUser[];
  readonly data?: readonly ApiUser[];
}

interface ApiUserResponse {
  readonly user?: ApiUser;
  readonly item?: ApiUser;
  readonly data?: ApiUser;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  getAll(): Observable<readonly ManagedUser[]> {
    return this.http
      .get<readonly ApiUser[] | ApiUserList>(apiUrl(this.config.apiUrl, API_LIST.users.list))
      .pipe(map((response) => this.userList(response).map((user) => this.toManagedUser(user))));
  }

  getById(id: string): Observable<ManagedUser> {
    return this.http
      .get<ApiUser | ApiUserResponse>(apiUrl(this.config.apiUrl, API_LIST.users.detail(id)))
      .pipe(map((response) => this.toManagedUser(this.userResponse(response))));
  }

  update(id: string, request: UpdateUserRequest): Observable<ManagedUser> {
    return this.http.put<ManagedUser>(
      apiUrl(this.config.apiUrl, API_LIST.users.detail(id)),
      request,
    );
  }

  setActive(id: string, active: boolean): Observable<void> {
    return this.http.put<void>(apiUrl(this.config.apiUrl, API_LIST.users.status(id)), { active });
  }

  resetPassword(id: string, request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(
      apiUrl(this.config.apiUrl, API_LIST.users.resetPassword(id)),
      request,
    );
  }

  private userList(response: readonly ApiUser[] | ApiUserList): readonly ApiUser[] {
    if (Array.isArray(response)) {
      return response;
    }

    const list = response as ApiUserList;
    return list.users ?? list.items ?? list.data ?? [];
  }

  private userResponse(response: ApiUser | ApiUserResponse): ApiUser {
    const wrapped = response as ApiUserResponse;
    return wrapped.user ?? wrapped.item ?? wrapped.data ?? (response as ApiUser);
  }

  private toManagedUser(user: ApiUser): ManagedUser {
    const [nameFirst = '', ...nameRest] = (user.name ?? '').trim().split(/\s+/);
    const roles = user.roles ?? (user.role ? [user.role] : []);

    return {
      id: user.id,
      firstName: user.firstName ?? nameFirst,
      lastName: user.lastName ?? nameRest.join(' '),
      email: user.email ?? '',
      active: user.active ?? user.isActive ?? false,
      roles,
      createdAt: user.createdAt,
    };
  }
}
