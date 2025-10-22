import { z } from 'zod';

// Schema de validação para login
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'A senha deve ter no mínimo 8 caracteres'),
});

export type SignInFormData = z.infer<typeof signInSchema>;

// Schema de validação para cadastro
export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Nome completo é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      // Remove caracteres não numéricos
      const cleaned = val.replace(/\D/g, '');
      return cleaned.length === 11;
    }, 'Telefone deve ter 11 dígitos (DDD + número)'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'A senha deve conter pelo menos um caractere especial'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
  affiliated_to: z
    .string()
    .min(1, 'Selecione uma unidade'),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, 'Você deve aceitar os termos e condições'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Schema de validação para indicação
export const indicationSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Nome completo é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  email: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      return z.string().email().safeParse(val).success;
    }, 'E-mail inválido'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine((val) => {
      // Remove caracteres não numéricos
      const cleaned = val.replace(/\D/g, '');
      return cleaned.length === 11;
    }, 'Telefone deve ter 11 dígitos (DDD + número)'),
  product: z
    .string()
    .optional(),
  observations: z
    .string()
    .optional(),
});

export type IndicationSchema = z.infer<typeof indicationSchema>;

// Schema de validação para indicação múltipla (com email para consentimento B2B)
export const multiIndicationSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Nome completo é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  email: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      return z.string().email().safeParse(val).success;
    }, 'E-mail inválido'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine((val) => {
      // Remove caracteres não numéricos
      const cleaned = val.replace(/\D/g, '');
      return cleaned.length === 11;
    }, 'Telefone deve ter 11 dígitos (DDD + número)'),
  product: z
    .string()
    .optional(),
  observations: z
    .string()
    .optional(),
});

export type MultiIndicationSchema = z.infer<typeof multiIndicationSchema>;

