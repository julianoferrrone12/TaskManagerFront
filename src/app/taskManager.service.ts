import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})
export class TaskManagerService {
    private apiUrl = 'http://127.0.0.1:8081/api';

    constructor(private http: HttpClient) { }

    getItems(query: QueryObject = {}): Observable<Task[]> {
        let params = new HttpParams();

        if (query.name) {
            params = params.set('name', query.name);
        }
        if (query.status) {
            params = params.set('status', query.status);
        }
        if (query.sortBy) {
            params = params.set('sortBy', query.sortBy);
        }
        if (query.isDescending !== undefined) {
            params = params.set('isDescending', query.isDescending.toString());
        }
        if (query.pageNumber !== undefined) {
            params = params.set('pageNumber', query.pageNumber.toString());
        }
        if (query.pageSize !== undefined) {
            params = params.set('pageSize', query.pageSize.toString());
        }

        return this.http.get<Task[]>(`${this.apiUrl}/item`, { params }).pipe(
            catchError(this.handleError)
        );
    }


    updateTask(taskId: number, payload: any): Observable<any> {
        const url = `${this.apiUrl}/item/${taskId}`;
        return this.http.put<any>(url, payload).pipe(
            catchError(this.handleError)
        );
    }

    createTask(payload: any): Observable<any> {
        const url = `${this.apiUrl}/item`;
        return this.http.post<any>(url, payload).pipe(
            catchError(this.handleError)
        );
    }

    editTask(taskId: number, payload: any): Observable<any> {
        const url = `${this.apiUrl}/item/${taskId}`;
        return this.http.put<any>(url, payload).pipe(
            catchError(this.handleError)
        );
    }

    deleteTask(taskId: number): Observable<any> {
        const url = `${this.apiUrl}/item/${taskId}`;
        return this.http.delete<any>(url, { responseType: 'text' as 'json' }).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Um erro desconhecido ocorreu!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Erro: ${error.error.message}`;
        } else {
            if (error.status === 400 && error.error && error.error.errors) {
                errorMessage = 'Erro de validação: ' + Object.values(error.error.errors).flat().join(', ');
            } else {
                errorMessage = `Código de erro ${error.status}: ${error.message}`;
            }
        }
        return throwError(() => new Error(errorMessage));
    }



}



export interface Task {
    id: number;
    name: string;
    description?: string;
    status: TaskSituation;
    createdDate: string;
}


export interface QueryObject {
    name?: string;
    status?: string;
    sortBy?: string;
    isDescending?: boolean;
    pageNumber?: number;
    pageSize?: number;
}

export enum TaskSituation {
    Pending = 'Pending',
    InProgress = 'InProgress',
    Completed = 'Completed',
}