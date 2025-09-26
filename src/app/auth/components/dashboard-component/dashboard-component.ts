import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.scss']
})
export class DashboardComponent implements OnInit {
  data = '';

  constructor(private http: HttpClient, private authService: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.http.get('/protected').subscribe({
      next: (res: any) => this.data = res.success ? 'success' : 'failed',
      error: (err) => this.data = err ? 'failed' : 'failed'
    });
  }

 logout() {
  this.authService.logout().subscribe(() => {
    // rediriger vers login
    this.router.navigate(['/login']);
  });
}
}

