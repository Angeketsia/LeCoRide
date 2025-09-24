export class RegisterFormValue{

  first_name!: string;
  last_name!: string;

  contact_preference!: string;
  email?: string;
  phone?: string;
  
  password!: string;
  confirm_password!: string;

  consent: boolean = false;
}
