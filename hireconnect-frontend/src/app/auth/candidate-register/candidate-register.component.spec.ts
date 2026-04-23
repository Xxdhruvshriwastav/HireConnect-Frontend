export class CandidateRegisterComponent {

  form: any = {};

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    const payload = {
      email: this.form.email,
      passwordHash: this.form.password,
      role: 'CANDIDATE'   // 🔥 AUTO
    };

    this.auth.register(payload).subscribe({
      next: () => {
        alert('Registered');
        this.router.navigate(['/auth/login']);
      }
    });
  }
}