import {
  Equals,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'El nombre de usuario es necesario' })
  @MaxLength(20, { message: 'El nombre de usuario debe tener como máximo 20 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'El email es necesario' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es necesaria' })
  @MinLength(8, { message: 'La contraseña debe tener un mínimo de 8 caracteres' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'La contraseña debe contener al menos una letra mayúscula',
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'La contraseña debe contener al menos un número',
  })
  @Matches(/(?=.*[^A-Za-z0-9])/, {
    message: 'La contraseña debe contener al menos un símbolo',
  })
  password: string;

  @IsNotEmpty({ message: 'La confirmación de contraseña es necesaria' })
  @MinLength(8, { message: 'La confirmación debe tener un mínimo de 8 caracteres' })
  confirmPassword: string;

  @IsBoolean({ message: 'El campo debe tener un valor booleano' })
  @Equals(true, { message: 'Debe aceptar los términos y condiciones para continuar' })
  terms: boolean;
}
