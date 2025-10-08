"use client";

import React, { useState, useEffect } from "react";
import { createContext, useContext } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import { db } from "../lib/firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { uiStorage } from "@/utils/uiStorage";

interface UserData {
  displayName: string;
  email: string;
  affiliated_to: string;
  uid: string;
  profilePicture: string;
  phone: string;
  rule: string;
  authToken: any;
  unitName: string;
  unitId: string;
  // Configurações de UI
  uiSettings?: {
    sidebarCollapsed?: boolean;
    theme?: "light" | "dark" | "system";
  };
}

interface AuthContextData {
  userAuthenticated: boolean;
  signIn: (
    email: string,
    password: string,
    userType: "admin" | "socio"
  ) => Promise<void | string>;
  signOut: () => Promise<void | string>;
  forgotPassword: (email: string) => Promise<null | string>;
  isLoading: boolean;
  isLoadingLogin: boolean;
  userData: UserData | null;
  // Métodos para configurações de UI
  updateUISettings: (
    settings: Partial<UserData["uiSettings"]>
  ) => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();

  // Função para verificar se o cookie foi definido
  const checkCookieSet = async (
    maxAttempts = 30,
    delay = 150
  ): Promise<boolean> => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch("/api/auth/check", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          return true;
        }
      } catch (error) {
        console.error(`Tentativa ${i + 1}: Cookie ainda não definido`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return false;
  };

  // Função para verificar autenticação com retry
  const verifyAuthentication = async (): Promise<{
    success: boolean;
    userData?: any;
  }> => {
    try {
      const response = await fetch("/api/auth/check", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, userData: data.userData };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error("Erro ao verificar auth com cookie:", error);
      return { success: false };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setIsUserAuthenticated(false);
        setUserData(null);
        setIsLoading(false);

        try {
          await fetch("/api/sessionLogout", {
            method: "POST",
            credentials: "include",
          });

          // Limpa todas as configurações de UI do localStorage
          uiStorage.clear();
        } catch (error) {
          console.error("Erro ao limpar sessão:", error);
        }

        if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/consent") && !window.location.pathname.includes("/policy")) {
          window.location.href = "/login";
        }
        return;
      }

      // Se há usuário autenticado, verifica se o cookie foi definido
      if (user) {
        // Aguarda o cookie ser definido com retry
        const cookieSet = await checkCookieSet();

        if (cookieSet) {
          // Cookie foi definido, agora verifica a autenticação
          const authResult = await verifyAuthentication();

          if (authResult.success && authResult.userData) {
            setIsUserAuthenticated(true);
            setUserData(authResult.userData);
          } else {
            // Cookie não é válido ou erro na verificação
            setIsUserAuthenticated(false);
            setUserData(null);
            await fetch("/api/sessionLogout", {
              method: "POST",
              credentials: "include",
            });
          }
        } else {
          // Cookie não foi definido após várias tentativas
          console.warn("Cookie não foi definido após várias tentativas");
          setIsUserAuthenticated(false);
          setUserData(null);
          await fetch("/api/sessionLogout", {
            method: "POST",
            credentials: "include",
          });
        }
      }

      setIsLoading(false);
      setIsLoadingLogin(false);
    });

    return () => unsubscribe(); // limpa o listener ao desmontar
  }, []);

  async function signIn(
    email: string,
    password: string,
    userType: "admin" | "socio"
  ) {
    try {
      setIsLoadingLogin(true);

      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const idTokenResult = await user.getIdTokenResult();

      const rawRole = idTokenResult.claims.rule;
      if (typeof rawRole !== "string") {
        await signOut(auth);
        setIsLoadingLogin(false);
        return "Acesso negado: sem regra válida.";
      }
      const role = rawRole;

      const allowedRoles = ["admin_franqueadora", "admin_unidade"];
      if (!allowedRoles.includes(role)) {
        await signOut(auth);
        setIsLoadingLogin(false);
        return "Acesso negado: você não tem permissão para acessar o sistema!";
      }

      // Verificar se é o primeiro login e se o e-mail não está verificado
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const isFirstLogin = userData.isFirstLogin;
        const isEmailVerified = user.emailVerified;

        // Se for o primeiro login e o e-mail não estiver verificado, enviar e-mail de verificação
        if (isFirstLogin && !isEmailVerified) {
          try {
            await sendEmailVerification(user, {
              url:
                userType === "admin"
                  ? "https://indica.avantar.com.br/admin"
                  : "https://indica.avantar.com.br/socio",
              handleCodeInApp: true,
            });
            
            setIsLoadingLogin(false);
          } catch (verificationError: any) {
            console.error(
              "Erro ao enviar e-mail de verificação:",
              verificationError
            );
            setIsLoadingLogin(false);
            return "Erro ao enviar e-mail de verificação. Contate o suporte.";
          }
        }
      }

      switch (userType) {
        case "admin":
          {
            if (role === "admin_franqueadora") {
              const idToken = await user.getIdToken();
              const res = await fetch("/api/sessionLogin", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ idToken, role }),
              });

              if (res.ok) {
                // Aguarda o cookie ser definido antes de redirecionar
                const cookieSet = await checkCookieSet();
                if (cookieSet) {
                  router.replace("/admin");
                } else {
                  console.error("Falha ao definir cookie de sessão");
                  await signOut(auth);
                  return "Erro ao configurar sessão. Tente novamente.";
                }
                setIsLoadingLogin(false);
              } else {
                console.error(
                  "Algo de errado aconteceu ao gravar os Cookies",
                  res
                );
                await signOut(auth);
                return "Erro ao configurar sessão. Tente novamente.";
              }
            } else {
              await signOut(auth);
              return "Acesso negado: você não tem permissão para acessar o sistema!";
            }
          }
          break;
        case "socio": {
          if (role === "admin_unidade") {
            const idToken = await user.getIdToken();
            const res = await fetch("/api/sessionLogin", {
              method: "POST",
              headers: { "Content-type": "application/json" },
              body: JSON.stringify({ idToken, role }),
            });

            if (res.ok) {
              // Aguarda o cookie ser definido antes de redirecionar
              const cookieSet = await checkCookieSet();
              if (cookieSet) {
                router.replace("/socio");
              } else {
                console.error("Falha ao definir cookie de sessão");
                await signOut(auth);
                return "Erro ao configurar sessão. Tente novamente.";
              }
              setIsLoadingLogin(false);
            } else {
              console.error(
                "Algo de errado aconteceu ao gravar os Cookies",
                res
              );
              await signOut(auth);
              return "Erro ao configurar sessão. Tente novamente.";
            }
          } else {
            await signOut(auth);
            return "Acesso negado: você não tem permissão para acessar o sistema!";
          }
        }
      }

      setIsLoadingLogin(false);
      return "Autenticado com sucesso, redirecionando...";
    } catch (err: any) {
      setIsLoadingLogin(false);
      switch (err.code) {
        case "auth/invalid-email":
          return "E-mail inválido!";
        case "auth/user-disabled":
          return "Falha ao realizar o login conta desativada.";
        case "auth/user-not-found":
          return "Falha ao realizar o login usuário não encontrado.";
        case "auth/wrong-password":
          return "Falha ao realizar o login senha incorreta.";
        case "auth/too-many-requests":
          return "Muitas tentativas, tente novamente mais tarde.";
        case "auth/network-request-failed":
          return "Falha de conexão com a rede.";
        case "auth/invalid-credential":
          return "Falha ao realizar o login credenciais inválidas.";
        default:
          console.error(err);
          return "Erro desconhecido entre em contato com o suporte!";
      }
    }
  }

  async function handleSignOut() {
    try {
      // Marca que está fazendo logout para evitar verificações
      setIsLoggingOut(true);

      // Atualiza o estado local primeiro para evitar piscadas
      setIsUserAuthenticated(false);
      setUserData(null);

      // Tenta invalidar sessão no back-end
      const res = await fetch("/api/sessionLogout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Erro ao remover cookies de sessão no back-end", res);
      }

      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          await signOut(auth);
          // Limpa o uiSettings do localStorage
          uiStorage.clear();
        } catch (error) {
          console.error("Erro sair ou limpar sessão:", error);
        }
      }

      // Redireciona para login após limpeza
      router.replace("/login");
    } catch (err: any) {
      setIsLoggingOut(false); // Reseta a flag em caso de erro
      switch (err.code) {
        case "auth/no-current-user":
          return "Nenhum usuário autenticado no momento.";
        case "auth/network-request-failed":
          return "Falha de conexão com a internet";
        default:
          console.error(err);
          return "Erro desconhecido ao deslogar, entre em contato com o suporte!";
      }
    }
  }

  async function forgotPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return `Enviado para ${email}`;
    } catch (err: any) {
      switch (err.code) {
        case "auth/invalid-email":
          return "E-mail inválido!";
        case "auth/missing-email":
          return "E-mail não fornecido!";
        case "auth/user-not-found":
          return "Usuário não encontrado!";
        case "auth/too-many-requests":
          return "Muitas requisições em curto período";
        case "auth/network-request-failed":
          return "Falha na conexão de rede";
        default:
          console.error(err);
          return "Erro desconhecido, entre em contato com o suporte!";
      }
    }
  }

  async function updateUISettings(settings: Partial<UserData["uiSettings"]>) {
    if (!userData?.uid) return;

    try {
      const userRef = doc(db, "users", userData.uid);
      await updateDoc(userRef, {
        uiSettings: {
          ...userData.uiSettings,
          ...settings,
        },
      });

      // Atualiza o estado local
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              uiSettings: {
                ...prev.uiSettings,
                ...settings,
              },
            }
          : null
      );
    } catch (error) {
      console.error("Erro ao atualizar configurações de UI:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        userAuthenticated,
        signIn,
        signOut: handleSignOut,
        isLoading,
        userData,
        forgotPassword,
        isLoadingLogin,
        updateUISettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
