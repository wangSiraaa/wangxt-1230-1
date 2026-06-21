import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BerthPlan, BerthPlanDetail, CreateBerthPlan, UpdateBerthPlan } from '../models/berth-plan.model';

@Injectable({
  providedIn: 'root'
})
export class BerthPlanService {
  private apiUrl = 'http://localhost:5000/api/berthplans';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Operator': 'current-user'
    });
  }

  getAll(): Observable<BerthPlan[]> {
    return this.http.get<BerthPlan[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: string): Observable<BerthPlan> {
    return this.http.get<BerthPlan>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getDetailById(id: string): Observable<BerthPlanDetail> {
    return this.http.get<BerthPlanDetail>(`${this.apiUrl}/${id}/detail`, { headers: this.getHeaders() });
  }

  getByPlanNo(planNo: string): Observable<BerthPlan> {
    return this.http.get<BerthPlan>(`${this.apiUrl}/planNo/${planNo}`, { headers: this.getHeaders() });
  }

  getByStatus(status: number): Observable<BerthPlan[]> {
    return this.http.get<BerthPlan[]>(`${this.apiUrl}/status/${status}`, { headers: this.getHeaders() });
  }

  create(dto: CreateBerthPlan): Observable<BerthPlan> {
    return this.http.post<BerthPlan>(this.apiUrl, dto, { headers: this.getHeaders() });
  }

  update(id: string, dto: UpdateBerthPlan): Observable<BerthPlan> {
    return this.http.put<BerthPlan>(`${this.apiUrl}/${id}`, dto, { headers: this.getHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  startUnloading(id: string): Observable<BerthPlan> {
    return this.http.post<BerthPlan>(`${this.apiUrl}/${id}/start-unloading`, {}, { headers: this.getHeaders() });
  }

  completeUnloading(id: string): Observable<BerthPlan> {
    return this.http.post<BerthPlan>(`${this.apiUrl}/${id}/complete-unloading`, {}, { headers: this.getHeaders() });
  }
}
