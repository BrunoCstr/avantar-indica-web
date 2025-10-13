/**
 * Valida a força de uma senha
 * @param password - Senha a ser validada
 * @returns Objeto com isValid e message
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message: string;
} {
  // Regex para senha forte
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      message:
        "A senha deve conter:\n• Pelo menos 8 caracteres\n• Pelo menos uma letra maiúscula\n• Pelo menos uma letra minúscula\n• Pelo menos um número\n• Pelo menos um caractere especial (!@#$%^&*(),.?\":{}|<>)",
    };
  }

  return {
    isValid: true,
    message: "Senha válida",
  };
}

