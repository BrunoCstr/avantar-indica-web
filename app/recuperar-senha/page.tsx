"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { useAuth } from "@/context/Auth";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Spinner } from "@/components/Spinner";

// Schema de validação para recuperar senha
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [enviado, setEnviado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    title: "",
    description: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const result = await forgotPassword(data.email);

      if (result && result.includes("Enviado para")) {
        // Sucesso
        setEnviado(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        // Erro
        switch (result) {
          case "E-mail inválido!":
            setModalMessage({
              title: "Falha ao recuperar senha",
              description: "E-mail inválido!",
            });
            setIsModalVisible(true);
            break;
          case "E-mail não fornecido!":
            setModalMessage({
              title: "Falha ao recuperar senha",
              description: "E-mail não fornecido!",
            });
            setIsModalVisible(true);
            break;
          case "Usuário não encontrado!":
            setModalMessage({
              title: "Falha ao recuperar senha",
              description: "Usuário não encontrado!",
            });
            setIsModalVisible(true);
            break;
          case "Muitas requisições em curto período":
            setModalMessage({
              title: "Falha ao recuperar senha",
              description: "Muitas requisições em curto período. Tente novamente mais tarde.",
            });
            setIsModalVisible(true);
            break;
          case "Falha na conexão de rede":
            setModalMessage({
              title: "Falha ao recuperar senha",
              description: "Falha de conexão com a rede. Verifique sua internet.",
            });
            setIsModalVisible(true);
            break;
          default:
            setModalMessage({
              title: "Falha ao recuperar senha",
              description: "Erro desconhecido, entre em contato com o suporte!",
            });
            setIsModalVisible(true);
            break;
        }
      }
    } catch (error: any) {
      setModalMessage({
        title: "Falha ao recuperar senha",
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
      <div className="absolute inset-0 bg-dark-responsive" />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4 text-center">Recuperar senha</h1>
          <p className="text-white/80 text-center mb-8">
            Digite seu e-mail para receber as instruções de recuperação
          </p>

          {!enviado ? (
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
              <div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="E-mail"
                  className={`w-full bg-[#4A04A5]/30 border-2 ${
                    errors.email ? "border-red" : "border-[#29F3DF]"
                  } text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20`}
                />
                {errors.email && (
                  <p className="text-red text-sm mt-1 ml-2">{errors.email.message}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#29F3DF] hover:bg-[#29F3DF]/90 text-[#170138] font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Spinner size={32} />
                    ENVIANDO...
                  </>
                ) : (
                  "ENVIAR"
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-[#29F3DF] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-[#170138]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-white text-lg">
                E-mail enviado com sucesso!
                <br />
                Verifique sua caixa de entrada.
              </p>
              <p className="text-white/60 text-sm mt-2">
                Redirecionando para o login...
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal de Feedback */}
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