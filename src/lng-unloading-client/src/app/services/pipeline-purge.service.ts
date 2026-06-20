import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PipelinePurge, CreatePipelinePurge, UpdatePipelinePurge, ConfirmPurge } from '../models/pipeline-purge.model';

@Injectable({
  providedIn: 'root'
})
export class PipelinePurgeService {
  private apiUrl = 'http://localhost:5000/api/pipelinepurges';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Operator': 'current-user'
    });
  }

  getAll(): Observable<PipelinePurge[]> {
    return this.http.get<PipelinePurge[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: string): Observable<PipelinePurge> {
    return this.http.get<PipelinePurge>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getByBerthPlanId(berthPlanId: string): Observable<PipelinePurge[]> {
    return this.http.get<PipelinePurge[]>(`${this.apiUrl}/berthPlan/${berthPlanId}`, { headers: this.getHeaders() });
  }

  create(dto: CreatePipelinePurge): Observable<PipelinePurge> {
    return this.http.post<PipelinePurge>(this.apiUrl, dto, { headers: this.getHeaders() });
  }

  update(id: string, dto: UpdatePipelinePurge): Observable<PipelinePurge> {
    return this.http.put<PipelinePurge>(`${this.apiUrl}/${id}`, dto, { headers: this.getHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  confirmOxygenContent(id: string, dto: ConfirmPurge): Observable<PipelinePurge> {
    return this.http.post<PipelinePurge>(`${this.apiUrl}/${id}/confirm-oxygen`, dto, { headers: this.getHeaders() });
  }

  engineerConfirm(id: string): Observable<PipelinePurge> {
    return this.http.post<PipelinePurge>(`${this.apiUrl}/${id}/engineer-confirm`, {}, { headers: this.getHeaders() });
  }

  canStartUnloading(berthPlanId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/berthPlan/${berthPlanId}/can-unload`, { headers: this.getHeaders() });
  }
}
