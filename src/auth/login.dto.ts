import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'Debe ser un email valido' }) 
  email: string;

  @IsNotEmpty({ message: 'La contraseña es necesaria' })
  @MinLength(8, {message: 'La contraseña debe tener un minimo de 8 caracteres'})
  password: string;
}
