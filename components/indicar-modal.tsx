"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { useAuth } from "@/context/Auth";
import { AlertModal } from "@/components/alert-modal";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { indicationSchema, IndicationSchema } from "@/lib/validationSchemas";
import {
  fetchProducts,
  submitIndication,
  Product,
} from "@/services/indication/indicate-modal";

interface IndicarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IndicarModal({ isOpen, onClose }: IndicarModalProps) {
  const { userData } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    description: "",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IndicationSchema>({
    resolver: zodResolver(indicationSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      product: "",
      observations: "",
    },
  });

  // Carrega os produtos quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      setProducts([
        { name: "Seguro" },
        { name: "Consórcio" },
        { name: "Plano de Saúde" },
      ]);
      setIsLoadingProducts(false);
    }
  }, [isOpen]);

  const onSubmit = async (data: IndicationSchema) => {
    // Verifica se o usuário tem permissão para indicar
    if (userData?.rule === "nao_definida") {
      setAlertMessage({
        title: "Cadastro Pendente",
        description:
          "Seu cadastro ainda não foi aprovado pela unidade. Aguarde a aprovação para poder fazer indicações.",
      });
      setShowAlertModal(true);
      return;
    }

    // Abre o modal de confirmação
    setShowConfirmationModal(true);
  };

  const confirmSubmit = async () => {
    if (!consentChecked) {
      setAlertMessage({
        title: "Atenção",
        description:
          "Você precisa confirmar que obteve consentimento do indicado.",
      });
      setShowAlertModal(true);
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = control._formValues as IndicationSchema;

      if (!userData) {
        throw new Error("Dados do usuário não disponíveis");
      }

      await submitIndication(formData, {
        uid: userData.uid,
        displayName: userData.displayName,
        profilePicture: userData.profilePicture,
        affiliated_to: userData.affiliated_to,
        unitName: userData.unitName,
      });

      // Resetar formulário e fechar modais
      reset();
      setConsentChecked(false);
      setShowConfirmationModal(false);

      setAlertMessage({
        title: "Indicação enviada!",
        description: "Você pode acompanhar sua indicação no menu de status.",
      });
      setShowAlertModal(true);

      // Fechar o modal principal após um delay
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error: any) {
      setAlertMessage({
        title: "Erro ao enviar indicação",
        description:
          error.message ||
          "Não foi possível enviar a indicação. Tente novamente.",
      });
      setShowAlertModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);

    // Aplica a máscara (XX) XXXXX-XXXX
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 7) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(
        7
      )}`;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Principal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-lg bg-fifth-purple dark:bg-purple-black border-2 border-blue rounded-3xl p-6 mx-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex w-full justify-between items-center gap-4 mb-6">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center hover:bg-blue/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-blue" />
            </button>
            <h2 className="text-blue font-bold text-2xl mr-32">Indicar</h2>
            <div></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome e sobrenome */}
            <div>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Nome e sobrenome"
                    className={`w-full bg-fifth-purple dark:bg-purple-black border-2 ${
                      errors.fullName ? "border-red-500" : "border-blue"
                    } text-white placeholder:text-blue/70 px-4 py-3 rounded-xl focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20`}
                  />
                )}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullName.message}
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
                    placeholder="Telefone"
                    onChange={(e) =>
                      field.onChange(formatPhoneNumber(e.target.value))
                    }
                    className={`w-full bg-fifth-purple dark:bg-purple-black border-2 ${
                      errors.phone ? "border-red-500" : "border-blue"
                    } text-white placeholder:text-blue/70 px-4 py-3 rounded-xl focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20`}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Produto desejado */}
            <div className="relative">
              <Controller
                name="product"
                control={control}
                render={({ field }) => {
                  const [isOpen, setIsOpen] = useState(false);
                  const [searchTerm, setSearchTerm] = useState("");
                  const dropdownRef = useRef<HTMLDivElement>(null);

                  // Filtra os produtos baseado na busca
                  const filteredProducts = products.filter((product) =>
                    product.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  );

                  // Encontra o produto selecionado
                  const selectedProduct = products.find(
                    (p) => p.name === field.value
                  );

                  // Fecha o dropdown ao clicar fora
                  useEffect(() => {
                    const handleClickOutside = (event: MouseEvent) => {
                      if (
                        dropdownRef.current &&
                        !dropdownRef.current.contains(event.target as Node)
                      ) {
                        setIsOpen(false);
                      }
                    };

                    document.addEventListener("mousedown", handleClickOutside);
                    return () =>
                      document.removeEventListener(
                        "mousedown",
                        handleClickOutside
                      );
                  }, []);

                  return (
                    <>
                      <div ref={dropdownRef}>
                        {/* Botão que abre o dropdown */}
                        <button
                          type="button"
                          onClick={() =>
                            !isLoadingProducts && setIsOpen(!isOpen)
                          }
                          disabled={isLoadingProducts}
                          className={`w-full bg-fifth-purple dark:bg-purple-black border-2 ${
                            errors.product ? "border-red-500" : "border-blue"
                          } text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 text-left ${
                            isLoadingProducts
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <span
                            className={
                              selectedProduct ? "text-white" : "text-white/70"
                            }
                          >
                            {isLoadingProducts
                              ? "Carregando produtos..."
                              : selectedProduct?.name || "Produto desejado"}
                          </span>
                        </button>

                        {/* Ícone */}
                        {isLoadingProducts ? (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue/70 w-5 h-5 animate-spin pointer-events-none" />
                        ) : (
                          <ChevronDown
                            className={`absolute right-3 top-1/2 -translate-y-1/2 text-blue/70 w-5 h-5 pointer-events-none transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        )}

                        {/* Dropdown */}
                        {isOpen && (
                          <div className="absolute z-50 w-full mt-2 bg-fifth-purple dark:bg-purple-black border-2 border-blue rounded-xl shadow-lg overflow-hidden">
                            {/* Input de busca */}
                            <div className="p-2 border-b border-blue/20">
                              <input
                                type="text"
                                placeholder="Pesquisar produto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border border-blue/30 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue placeholder-white/50"
                                autoFocus
                              />
                            </div>

                            {/* Lista de produtos */}
                            <div className="max-h-60 overflow-y-auto">
                              {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                  <button
                                    key={product.id || product.name}
                                    type="button"
                                    onClick={() => {
                                      field.onChange(product.name);
                                      setIsOpen(false);
                                      setSearchTerm("");
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-blue/10 transition-colors ${
                                      field.value === product.name
                                        ? "bg-blue/20 text-blue"
                                        : "text-white"
                                    }`}
                                  >
                                    {product.name}
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-white/50 text-center">
                                  Nenhum produto encontrado
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {errors.product && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.product.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>

            {/* Observações */}
            <div>
              <Controller
                name="observations"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="Observações..."
                    className={`w-full bg-fifth-purple dark:bg-purple-black border-2 ${
                      errors.observations ? "border-red-500" : "border-blue"
                    } text-white placeholder:text-blue/70 px-4 py-3 rounded-xl focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 min-h-[100px] resize-none`}
                  />
                )}
              />
              {errors.observations && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.observations.message}
                </p>
              )}
            </div>

            {/* Botão ENVIAR */}
            <button
              type="submit"
              disabled={isSubmitting || isLoadingProducts}
              className="w-full bg-blue hover:bg-blue-light text-fifth-purple dark:text-purple-black font-bold py-4 px-6 rounded-xl transition-colors text-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  ENVIANDO...
                </>
              ) : (
                "ENVIAR"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSubmitting && setShowConfirmationModal(false)}
          />

          <div className="relative w-full max-w-md bg-fifth-purple dark:bg-purple-black border-2 border-blue rounded-3xl p-6 mx-auto">
            <h3 className="text-blue font-bold text-2xl text-center mb-4">
              Confirmar Envio
            </h3>

            <p className="text-white/70 text-sm text-center mb-4 leading-relaxed">
              Você está prestes a enviar 1 indicação para a unidade{" "}
              {userData?.unitName}.
            </p>

            {/* Texto de consentimento */}
            <div className="mb-4">
              <p className="text-xs text-center text-white/70 leading-relaxed mb-3">
                Ao informar os dados de terceiros (nome, telefone, etc.), você
                confirma que possui o consentimento dessa pessoa para
                compartilhar essas informações com a Avantar.
              </p>
            </div>

            {/* Checkbox de consentimento */}
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="consent"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                disabled={isSubmitting}
                className="mt-1 w-5 h-5 rounded border-2 border-blue bg-fifth-purple dark:bg-purple-black checked:bg-blue checked:border-blue cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label
                htmlFor="consent"
                className="text-white/70 text-xs cursor-pointer leading-relaxed"
              >
                Confirmo que tenho autorização do terceiro para compartilhar
                seus dados.
              </label>
            </div>

            {/* Botões */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setConsentChecked(false);
                }}
                disabled={isSubmitting}
                className="bg-white hover:bg-gray-100 text-fifth-purple dark:text-purple-black font-bold py-3 px-8 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CANCELAR
              </button>
              <button
                onClick={confirmSubmit}
                disabled={!consentChecked || isSubmitting}
                className="bg-blue hover:bg-blue-light text-fifth-purple dark:text-purple-black font-bold py-3 px-8 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ENVIANDO...
                  </>
                ) : (
                  "CONFIRMAR"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={alertMessage.title}
        message={alertMessage.description}
      />
    </>
  );
}
