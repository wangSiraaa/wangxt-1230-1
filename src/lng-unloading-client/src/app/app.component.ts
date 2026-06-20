import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>LNG 接收站卸船作业管理系统</h1>
        <nav class="app-nav">
          <a routerLink="/berth-plans" routerLinkActive="active">靠泊计划</a>
          <a routerLink="/pipeline-purges" routerLinkActive="active">管线置换</a>
          <a routerLink="/metering-records" routerLinkActive="active">计量交接</a>
          <a routerLink="/shutdown-events" routerLinkActive="active">异常停输</a>
        </nav>
      </header>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .app-header {
      background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
      color: white;
      padding: 0 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .app-header h1 {
      margin: 0;
      padding: 16px 0;
      font-size: 20px;
      font-weight: 600;
    }
    .app-nav {
      display: flex;
      gap: 4px;
    }
    .app-nav a {
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px 4px 0 0;
      font-size: 14px;
      transition: all 0.2s;
    }
    .app-nav a:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .app-nav a.active {
      background: white;
      color: #1976d2;
      font-weight: 500;
    }
    .app-main {
      flex: 1;
      padding: 24px;
      background: #f5f5f5;
    }
  `]
})
export class AppComponent { }
