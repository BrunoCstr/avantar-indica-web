"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/Auth";
import { signUpSchema, type SignUpFormData } from "@/lib/validationSchemas";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/Spinner";
import { motion } from "framer-motion";

interface Unit {
  name: string;
  unitId: string;
}

export default function CadastroPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    title: "",
    description: "",
  });
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      affiliated_to: "",
      phone: "",
      acceptTerms: false,
    },
  });

  useEffect(() => {
    // Buscar as unidades do Firebase
    const fetchUnits = async () => {
      try {
        const unitsCollection = collection(db, "units");
        const unitsSnapshot = await getDocs(unitsCollection);
        const unitsList = unitsSnapshot.docs.map((doc) => doc.data() as Unit);

        // Filtrar a unidade "Avantar Franqueadora" da lista
        const filteredUnits = unitsList.filter(
          (unit) => unit.name !== "Avantar Franqueadora"
        );

        setUnits(filteredUnits);
      } catch (error) {
        console.error("Erro ao buscar unidades:", error);
      }
    };

    fetchUnits();
  }, []);

  const onSubmit = async (data: SignUpFormData) => {
    const { confirmPassword, ...dataFiltred } = data;

    const unit = units.find((u) => u.unitId === dataFiltred.affiliated_to);
    const unitName = unit?.name ?? "";

    setIsLoading(true);
    try {
      const errorCode = await signUp(
        dataFiltred.fullName,
        dataFiltred.email,
        dataFiltred.password,
        dataFiltred.affiliated_to,
        dataFiltred.phone || "",
        unitName
      );

      if (errorCode) {
        switch (errorCode) {
          case "auth/email-already-in-use":
            setModalMessage({
              title: "Falha ao cadastrar o usuário",
              description: "E-mail já cadastrado.",
            });
            break;
          case "auth/invalid-email":
            setModalMessage({
              title: "Falha ao cadastrar o usuário",
              description: "E-mail inválido.",
            });
            break;
          case "auth/weak-password":
            setModalMessage({
              title: "Senha fraca",
              description:
                'A senha deve conter:\n• Pelo menos 8 caracteres\n• Pelo menos uma letra maiúscula\n• Pelo menos uma letra minúscula\n• Pelo menos um número\n• Pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)\n• Não pode ser uma senha comum',
            });
            break;
          case "auth/operation-not-allowed":
            setModalMessage({
              title: "Falha ao cadastrar o usuário",
              description:
                "Criação de conta com e-mail e senha não está habilitada.",
            });
            break;
          case "auth/network-request-failed":
            setModalMessage({
              title: "Falha ao cadastrar o usuário",
              description: "Falha de conexão com a rede.",
            });
            break;
          default:
            setModalMessage({
              title: "Falha ao cadastrar o usuário",
              description: "Erro desconhecido, entre em contato com o suporte!",
            });
        }

        setIsModalVisible(true);
      } else {
        // Se não há erro, mostrar mensagem de sucesso
        setModalMessage({
          title: "Verificação de e-mail",
          description: "Verifique seu e-mail para validar seu cadastro!",
        });
        setIsModalVisible(true);

        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error: any) {
      // Capturar erro de validação de senha com mensagem detalhada
      if (error.message && error.message.includes("A senha deve conter:")) {
        setModalMessage({
          title: "Senha fraca",
          description: error.message,
        });
        setIsModalVisible(true);
        return;
      }

      setModalMessage({
        title: "Falha ao cadastrar o usuário",
        description: "Erro desconhecido, entre em contato com o suporte!",
      });
      setIsModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, "");

    // Aplica a máscara (XX) XXXXX-XXXX
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
        7,
        11
      )}`;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-dark-responsive" />

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6 pb-24">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Faça seu cadastro
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
            {/* Nome Completo */}
            <div>
              <input
                {...register("fullName")}
                type="text"
                placeholder="Nome e Sobrenome"
                className={`w-full bg-[#4A04A5]/30 border-2 ${
                  errors.fullName ? "border-red" : "border-[#29F3DF]"
                } text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20`}
              />
              {errors.fullName && (
                <p className="text-red text-sm mt-1 ml-2">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* E-mail */}
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
                <p className="text-red text-sm mt-1 ml-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="tel"
                    placeholder="Telefone (Opcional)"
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      field.onChange(formatted);
                    }}
                    maxLength={15}
                    className={`w-full bg-[#4A04A5]/30 border-2 ${
                      errors.phone ? "border-red" : "border-[#29F3DF]"
                    } text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20`}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-red text-sm mt-1 ml-2">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Senha */}
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

            {/* Confirmar Senha */}
            <div>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  className={`w-full bg-[#4A04A5]/30 border-2 ${
                    errors.confirmPassword ? "border-red" : "border-[#29F3DF]"
                  } text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red text-sm mt-1 ml-2">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Seleção de Unidade */}
            <div>
              <Controller
                name="affiliated_to"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={`w-full bg-[#4A04A5]/30 border-2 ${
                        errors.affiliated_to ? "border-red" : "border-[#29F3DF]"
                      } text-white placeholder:text-white/60 px-6 py-4 rounded-2xl h-[80px] focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20`}
                    >
                      <SelectValue
                        placeholder="Selecione uma unidade"
                        className="text-white/60 font-bold"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-[#170138] border-2 border-[#29F3DF] text-white">
                      {units.map((unit) => (
                        <SelectItem
                          key={unit.unitId}
                          value={unit.unitId}
                          className="text-white hover:bg-[#4A04A5]/50 cursor-pointer"
                        >
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.affiliated_to && (
                <p className="text-red text-sm mt-1 ml-2">
                  {errors.affiliated_to.message}
                </p>
              )}
            </div>

            {/* Botão de Cadastro */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#29F3DF] hover:bg-[#29F3DF]/90 text-[#170138] font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-700 flex justify-center items-center"
            >
              {isLoading ? <Spinner size={32}/> : "CADASTRAR"}
            </motion.button>

            {/* Checkbox de Termos */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <Controller
                control={control}
                name="acceptTerms"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="terms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className={`${
                        errors.acceptTerms
                          ? "border-red data-[state=checked]:bg-red"
                          : "border-white [&_svg]:text-[#170138] data-[state=checked]:bg-[#29F3DF] data-[state=checked]:border-[#29F3DF]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setIsTermsModalVisible(true)}
                      className={`underline text-sm ${
                        errors.acceptTerms ? "text-red" : "text-white"
                      } hover:text-[#29F3DF]`}
                    >
                      Aceito termos e condições*
                    </button>
                  </div>
                )}
              />
            </div>
            {errors.acceptTerms && (
              <p className="text-red text-sm text-center">
                {errors.acceptTerms.message}
              </p>
            )}
          </form>
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

      {/* Modal de Termos e Condições */}
      <Dialog open={isTermsModalVisible} onOpenChange={setIsTermsModalVisible}>
        <DialogContent className="bg-[#170138] border-2 border-[#29F3DF] text-white max-w-[95%] sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold text-center">
              Termo de Uso e Política de Privacidade
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <DialogDescription className="text-white/90 text-sm space-y-4">
              <div>
                <p className="font-bold">
                  TERMO DE USO DO APLICATIVO DE INDICAÇÕES – AVANTAR FRANCHISING
                  <br />
                  Data da última atualização: 06/10/2025
                </p>
                <p className="mt-2">
                  Este Termo de Uso regula as condições gerais de utilização do
                  aplicativo de indicações (&quot;Aplicativo&quot;),
                  desenvolvido e mantido pela AVANTAR FRANCHISING, doravante
                  denominada &quot;Franqueadora&quot;.
                </p>
                <p className="mt-2">
                  Ao acessar e utilizar o Aplicativo, o USUÁRIO declara ter
                  lido, compreendido e aceito integralmente os presentes termos.
                </p>
              </div>

              <div>
                <p className="font-bold">1. OBJETIVO DO APLICATIVO</p>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>
                    Facilitar a indicação de potenciais clientes (leads) para as
                    unidades franqueadas da rede AVANTAR;
                  </li>
                  <li>
                    Permitir o acompanhamento do status das indicações pelos
                    usuários;
                  </li>
                  <li>
                    Possibilitar o pagamento de comissões, cashback ou
                    bonificações, conforme regras específicas definidas pela
                    Franqueadora.
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-bold">2. PÚBLICOS ENVOLVIDOS</p>
                <p className="mt-1">
                  Indicadores, Franqueados, Administração da Franqueadora e
                  Usuários Administradores.
                </p>
              </div>

              <div>
                <p className="font-bold">3. DADOS COLETADOS</p>
                <p className="mt-1">
                  Nome, e-mail, telefone, CPF ou CNPJ, chave Pix, dados
                  bancários, dados dos leads (nome, telefone, tipo de seguro),
                  dados de uso (histórico de propostas, status, movimentações).
                </p>
              </div>

              <div>
                <p className="font-bold">4. FINALIDADE DO USO DOS DADOS</p>
                <p className="mt-1">
                  Direcionamento de leads, comunicação entre as partes, análise
                  de performance, pagamentos.
                </p>
              </div>

              <div>
                <p className="font-bold">5. COMPARTILHAMENTO DE DADOS</p>
                <p className="mt-1">
                  Leads com franqueados. Usuários com parceiros como
                  instituições de pagamento, marketing, nuvem, etc.
                </p>
              </div>

              <div>
                <p className="font-bold">6. BASE LEGAL (LGPD)</p>
                <p className="mt-1">
                  Consentimento, legítimo interesse, execução de contrato,
                  obrigações legais.
                </p>
              </div>

              <div>
                <p className="font-bold">7. SEGURANÇA DA INFORMAÇÃO</p>
                <p className="mt-1">
                  Criptografia, HTTPS, autenticação e servidores seguros.
                </p>
              </div>

              <div>
                <p className="font-bold">8. DIREITOS DO USUÁRIO</p>
                <p className="mt-1">
                  Acesso, correção, exclusão, portabilidade, revogação de
                  consentimento (via suporte@indica.avantar.com.br).
                </p>
              </div>

              <div>
                <p className="font-bold">9. REGRAS DE USO</p>
                <p className="mt-1">
                  Uso ilícito é vedado. Descumprimentos podem levar à
                  suspensão/cancelamento do acesso.
                </p>
              </div>

              <div>
                <p className="font-bold">10. CONSENTIMENTO E REGISTRO</p>
                <p className="mt-1">
                  Aceite obrigatório no primeiro acesso. O fornecimento de dados
                  de terceiros exige autorização.
                </p>
              </div>

              <div>
                <p className="font-bold">11. ARMAZENAMENTO E RETENÇÃO</p>
                <p className="mt-1">
                  Dados em nuvem, retidos conforme necessidade legal e
                  finalidade do uso.
                </p>
              </div>

              <div>
                <p className="font-bold">12. ATUALIZAÇÕES DOS TERMOS</p>
                <p className="mt-1">
                  A Franqueadora poderá atualizar os termos com aviso prévio no
                  app. Uso contínuo implica aceitação.
                </p>
              </div>

              <div>
                <p className="font-bold">DÚVIDAS E CONTATO:</p>
                <p className="mt-1">suporte@indica.avantar.com.br</p>
              </div>

              <div className="mt-6">
                <p className="font-bold">
                  POLÍTICA DE PRIVACIDADE – AVANTAR INDICA
                  <br />
                  Última atualização: 06/10/2025
                </p>
              </div>

              <div>
                <p className="font-bold">1. COLETA DE DADOS</p>
                <div className="ml-4 mt-1 space-y-2">
                  <div>
                    <p className="font-semibold">
                      1.1. Dos Indicadores (Usuários do App):
                    </p>
                    <p>• Nome, e-mail, telefone, CPF ou CNPJ, chave PIX</p>
                    <p>
                      • Coletados mediante cadastro voluntário e consentimento
                      expresso
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      1.2. Dos Leads (Terceiros Indicados):
                    </p>
                    <p>
                      • Coleta inicial: apenas e-mail e tipo de seguro de
                      interesse
                    </p>
                    <p>
                      • Coleta posterior (mediante consentimento do próprio
                      lead): nome completo e telefone
                    </p>
                    <p>
                      • Método de coleta: o próprio lead fornece seus dados
                      através de formulário após receber e aceitar convite por
                      e-mail
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">1.3. Dados de Uso:</p>
                    <p>• Data e horário das indicações, status da proposta</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-bold">2. FINALIDADES</p>
                <p className="mt-1">Os dados são utilizados para:</p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Direcionar leads às unidades corretas</li>
                  <li>
                    Permitir comunicação entre franqueado, indicador e lead
                  </li>
                  <li>Avaliar desempenho de unidades e indicadores</li>
                  <li>Processar pagamentos e bonificações</li>
                  <li>Cumprir obrigações legais e operacionais</li>
                </ul>
              </div>

              <div>
                <p className="font-bold">3. COMPARTILHAMENTO DE DADOS</p>
                <div className="ml-4 mt-1 space-y-2">
                  <div>
                    <p className="font-semibold">3.1. Dados dos Indicadores:</p>
                    <p>
                      • Compartilhados com unidades franqueadas para
                      identificação da origem da indicação e processamento de
                      bonificações
                    </p>
                    <p>
                      • Compartilhados com parceiros operacionais (processadores
                      de pagamento, sistemas de auditoria) sob acordos de
                      confidencialidade
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">3.2. Dados dos Leads:</p>
                    <p>
                      • Nunca são compartilhados sem o consentimento prévio e
                      explícito do próprio lead
                    </p>
                    <p>
                      • Após o lead confirmar seu interesse e fornecer seus
                      dados voluntariamente, essas informações são
                      compartilhadas exclusivamente com a unidade franqueada
                      responsável pelo atendimento
                    </p>
                    <p>
                      • O lead é informado previamente sobre qual unidade
                      receberá seus dados
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      Responsabilidade compartilhada:
                    </p>
                    <p>
                      • O indicador é responsável por garantir autorização
                      verbal prévia para envio do convite ao e-mail do lead
                    </p>
                    <p>
                      • A Avantar garante que nenhum dado sensível (nome
                      completo, telefone) seja processado antes da confirmação
                      ativa do lead
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-bold">
                  3.1. CONSENTIMENTO DO LEAD (TERCEIRO INDICADO)
                </p>
                <p className="mt-1">
                  Antes que qualquer dado pessoal de um lead seja armazenado:
                </p>
                <ol className="list-decimal list-inside ml-4 mt-1">
                  <li>
                    Coleta Inicial Limitada: O indicador fornece apenas o e-mail
                    e o tipo de seguro de interesse do lead
                  </li>
                  <li>
                    Verificação de Consentimento: Enviamos e-mail solicitando
                    (i) confirmação de interesse, (ii) autorização para
                    compartilhar dados com a unidade franqueada e (iii) aceite
                    dos Termos e da Política
                  </li>
                  <li>
                    Fornecimento Voluntário: Somente após o clique de
                    confirmação e o fornecimento voluntário de nome e telefone
                    pelo lead, os dados são armazenados e compartilhados com a
                    unidade
                  </li>
                  <li>
                    Recusa: Se o lead não confirmar ou recusar, nenhum dado
                    adicional além do e-mail é coletado e este é excluído após 7
                    dias
                  </li>
                  <li>
                    Transparência: O lead é informado sobre (i) quem indica,
                    (ii) qual unidade receberá os dados, (iii) finalidade do
                    contato e (iv) seus direitos sob a LGPD
                  </li>
                </ol>
                <p className="mt-2 font-semibold">
                  Importante: O app não permite que indicadores insiram dados
                  completos de terceiros sem consentimento ativo do lead via
                  e-mail.
                </p>
              </div>

              <div>
                <p className="font-bold">4. BASE LEGAL (LGPD)</p>
                <div className="ml-4 mt-1 space-y-2">
                  <div>
                    <p className="font-semibold">4.1. Para Indicadores:</p>
                    <p>• Consentimento expresso no momento do cadastro</p>
                    <p>• Execução de contrato (programa de indicações)</p>
                  </div>
                  <div>
                    <p className="font-semibold">4.2. Para Leads:</p>
                    <p>
                      • Consentimento explícito e verificável via confirmação
                      por e-mail
                    </p>
                    <p>
                      • O lead fornece seus próprios dados de forma voluntária
                      após ser informado
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">4.3. Legítimo Interesse:</p>
                    <p>
                      • Processamento de indicações dentro do modelo de franquia
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-bold">5. SEGURANÇA</p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>
                    Dados trafegam via HTTPS e são armazenados em banco seguro
                  </li>
                  <li>Acesso restrito a usuários autenticados e habilitados</li>
                </ul>
              </div>

              <div>
                <p className="font-bold">6. DIREITOS DOS USUÁRIOS</p>
                <p className="mt-1">
                  Conforme a LGPD, o usuário tem direito de:
                </p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Acessar, corrigir ou excluir seus dados</li>
                  <li>Solicitar portabilidade</li>
                  <li>
                    Revogar o consentimento, a qualquer momento, salvo
                    obrigações legais
                  </li>
                </ul>
                <p className="mt-2">
                  Solicitações: suporte@indica.avantar.com.br
                </p>
              </div>

              <div>
                <p className="font-bold">7. ARMAZENAMENTO E RETENÇÃO</p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>
                    Dados armazenados em nuvem enquanto durar a relação com o
                    usuário ou conforme exigência legal
                  </li>
                  <li>
                    Após esse período, os dados serão anonimizados ou excluídos
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-bold">8. ATUALIZAÇÕES</p>
                <p className="mt-1">
                  A franqueadora poderá atualizar esta Política a qualquer
                  momento. O aviso será feito via aplicativo, e o uso contínuo
                  após alterações implica aceite automático.
                </p>
              </div>
            </DialogDescription>
          </ScrollArea>
          <div className="mt-4">
            <button
              onClick={() => setIsTermsModalVisible(false)}
              className="w-full bg-[#29F3DF] text-[#170138] hover:bg-[#29F3DF]/90 font-bold py-3 px-6 rounded-lg"
            >
              FECHAR
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
