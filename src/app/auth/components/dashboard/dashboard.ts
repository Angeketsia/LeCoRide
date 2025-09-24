import { AuthService } from './../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  data = '';

  constructor(private http: HttpClient, private authService: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.http.get('/protected').subscribe({
      next: (res: any) => this.data = res.success ? 'success' : 'failed',
      error: (err) => this.data = 'failed'
    });
  }

 logout() {
  this.authService.logout().subscribe(() => {
    // rediriger vers login
    this.router.navigate(['/login']);
  });
}
}

