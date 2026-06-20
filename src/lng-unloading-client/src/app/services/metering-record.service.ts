import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MeteringRecord, CreateMeteringRecord, UpdateMeteringRecord, ReviewMetering } from '../models/metering-record.model';

@Injectable({
  providedIn: 'root'
})
export class MeteringRecordService {
  private apiUrl = 'http://localhost:5000/api/meteringrecords';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Operator': 'current-user'
    });
  }

  getAll(): Observable<MeteringRecord[]> {
    return this.http.get<MeteringRecord[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: string): Observable<MeteringRecord> {
    return this.http.get<MeteringRecord>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getByBerthPlanId(berthPlanId: string): Observable<MeteringRecord[]> {
    return this.http.get<MeteringRecord[]>(`${this.apiUrl}/berthPlan/${berthPlanId}`, { headers: this.getHeaders() });
  }

  create(dto: CreateMeteringRecord): Observable<MeteringRecord> {
    return this.http.post<MeteringRecord>(this.apiUrl, dto, { headers: this.getHeaders() });
  }

  update(id: string, dto: UpdateMeteringRecord): Observable<MeteringRecord> {
    return this.http.put<MeteringRecord>(`${this.apiUrl}/${id}`, dto, { headers: this.getHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  submit(id: string): Observable<MeteringRecord> {
    return this.http.post<MeteringRecord>(`${this.apiUrl}/${id}/submit`, {}, { headers: this.getHeaders() });
  }

  review(id: string, dto: ReviewMetering): Observable<MeteringRecord> {
    return this.http.post<MeteringRecord>(`${this.apiUrl}/${id}/review`, dto, { headers: this.getHeaders() });
  }
}
