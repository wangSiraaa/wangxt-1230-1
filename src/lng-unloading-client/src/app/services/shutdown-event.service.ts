import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShutdownEvent, CreateShutdownEvent, UpdateShutdownEvent, RecordRecoveryCondition } from '../models/shutdown-event.model';

@Injectable({
  providedIn: 'root'
})
export class ShutdownEventService {
  private apiUrl = 'http://localhost:5000/api/shutdownevents';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Operator': 'current-user'
    });
  }

  getAll(): Observable<ShutdownEvent[]> {
    return this.http.get<ShutdownEvent[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: string): Observable<ShutdownEvent> {
    return this.http.get<ShutdownEvent>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getByBerthPlanId(berthPlanId: string): Observable<ShutdownEvent[]> {
    return this.http.get<ShutdownEvent[]>(`${this.apiUrl}/berthPlan/${berthPlanId}`, { headers: this.getHeaders() });
  }

  getByStatus(status: number): Observable<ShutdownEvent[]> {
    return this.http.get<ShutdownEvent[]>(`${this.apiUrl}/status/${status}`, { headers: this.getHeaders() });
  }

  create(dto: CreateShutdownEvent): Observable<ShutdownEvent> {
    return this.http.post<ShutdownEvent>(this.apiUrl, dto, { headers: this.getHeaders() });
  }

  update(id: string, dto: UpdateShutdownEvent): Observable<ShutdownEvent> {
    return this.http.put<ShutdownEvent>(`${this.apiUrl}/${id}`, dto, { headers: this.getHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  recordRecoveryCondition(id: string, dto: RecordRecoveryCondition): Observable<ShutdownEvent> {
    return this.http.post<ShutdownEvent>(`${this.apiUrl}/${id}/record-recovery`, dto, { headers: this.getHeaders() });
  }

  resume(id: string): Observable<ShutdownEvent> {
    return this.http.post<ShutdownEvent>(`${this.apiUrl}/${id}/resume`, {}, { headers: this.getHeaders() });
  }

  close(id: string): Observable<ShutdownEvent> {
    return this.http.post<ShutdownEvent>(`${this.apiUrl}/${id}/close`, {}, { headers: this.getHeaders() });
  }
}
