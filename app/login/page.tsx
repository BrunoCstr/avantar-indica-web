"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/Auth";
import { signInSchema, type SignInFormData } from "@/lib/validationSchemas";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/Spinner";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    title: "",
    description: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const errorCode = await signIn(data.email, data.password, "nao_definido");

      if (errorCode) {
        switch (errorCode) {
          case "auth/invalid-email":
          case "E-mail inválido!":
            setModalMessage({
              title: "Falha ao realizar o login",
              description: "E-mail inválido!",
            });
            setIsModalVisible(true);
            break;
          case "auth/user-disabled":
          case "Falha ao realizar o login conta desativada.":
            setModalMessage({
              title: "Falha ao realizar o login",
              description: "Conta desativada.",
            });
            setIsModalVisible(true);
            break;
          case "auth/user-not-found":
          case "Falha ao realizar o login usuário não encontrado.":
            setModalMessage({
              title: "Falha ao realizar o login",
              description: "Usuário não encontrado.",
            });
            setIsModalVisible(true);
            break;
          case "auth/wrong-password":
          case "Falha ao realizar o login senha incorreta.":
            setModalMessage({
              title: "Falha ao realizar o login",
              description: "Senha incorreta.",
            });
            setIsModalVisible(true);
            break;
          case "auth/too-many-requests":
          case "Muitas tentativas, tente novamente mais tarde.":
            setModalMessage({
              title: "Falha ao realizar o login",
              description: "Muitas tentativas. Tente novamente mais tarde.",
            });
            setIsModalVisible(true);
            break;
          case "auth/network-request-failed":
          case "Falha de conexão com a rede.":
            setModalMessage({
              title: "Falha ao realizar o login",
              description: "Falha de conexão com a rede.",
            });
            setIsModalVisible(true);
            break;
          case "auth/invalid-credential":
          case "Falha ao realizar o login credenciais inválidas.":
            setModalMessage({
              title: "Falha ao realizar o login",
              description: "Credenciais inválidas.",
            });
            setIsModalVisible(true);
            break;
          case "Acesso negado: você não tem permissão para acessar o sistema!":
            setModalMessage({
              title: "Falha ao realizar o login",
              description: "Você não tem permissão para acessar o sistema!",
            });
            setIsModalVisible(true);
            break;
          default:
            setModalMessage({
              title: "Falha ao realizar o login",
              description: "Erro desconhecido, entre em contato com o suporte!",
            });
            setIsModalVisible(true);
            break;
        }
      }
    } catch (error: any) {
      setModalMessage({
        title: "Falha ao realizar o login",
        description: "Erro desconhecido, entre em contato com o suporte!",
      });
      setIsModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background com imagem */}
      <div className="absolute inset-0 bg-login-responsive" />

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-8">
          <BackButton route="/" />
        </div>

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <h1 className="text-3xl font-bold text-white mb-12">
            Faça seu login
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md space-y-6"
          >
            <div>
              <input
                {...register("email")}
                type="text"
                placeholder="Login"
                className={`w-full bg-[#4A04A5]/30 border-2 ${
                  errors.email ? "border-red" : "border-[#29F3DF]"
                } text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20`}
              />
              {errors.email && (
                <p className="text-red text-sm mt-1 ml-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  className={`w-full bg-[#4A04A5]/30 border-2 ${
                    errors.password ? "border-red" : "border-[#29F3DF]"
                  } text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red text-sm mt-1 ml-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-blue text-tertiary-purple font-bold flex justify-center items-center rounded-2xl text-lg transition-all duration-700"
            >
              {isLoading ? <Spinner size={32} /> : "ENTRAR"}
            </motion.button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/recuperar-senha")}
                className="text-white underline hover:text-[#29F3DF] transition-colors"
              >
                Esqueci minha senha!
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de feedback */}
      <AlertDialog open={isModalVisible} onOpenChange={setIsModalVisible}>
        <AlertDialogContent className="bg-[#170138] border-2 border-[#29F3DF] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-center">
              {modalMessage.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/80 text-center whitespace-pre-line">
              {modalMessage.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setIsModalVisible(false)}
              className="bg-[#29F3DF] text-[#170138] hover:bg-[#29F3DF]/90 w-full"
            >
              FECHAR
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
