import z from 'zod';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
      .max(20, 'Tên người dùng không được vượt quá 20 ký tự')
      .regex(USERNAME_REGEX, 'Tên người dùng không hợp lệ'),
    email: z
      .string()
      .email(EMAIL_REGEX, 'Email không hợp lệ')
      .min(1, 'Email không được để trống'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(PASSWORD_REGEX, 'Mật khẩu không hợp lệ')
      .min(1, 'Mật khẩu không được để trống'),
    confirmPassword: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(PASSWORD_REGEX, 'Mật khẩu không hợp lệ')
      .min(1, 'Mật khẩu không được để trống'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z
    .string()
    .email(EMAIL_REGEX, 'Email không hợp lệ')
    .min(1, 'Email không được để trống'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(PASSWORD_REGEX, 'Mật khẩu không hợp lệ'),
});

const changePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(PASSWORD_REGEX, 'Mật khẩu không hợp lệ'),
  new_password: z
    .string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .regex(PASSWORD_REGEX, 'Mật khẩu mới không hợp lệ'),
});

export { registerSchema, loginSchema, changePasswordSchema };
