"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { ChevronDown, Users, Send, UserPlus, Trash2, CheckCircle, Edit, Loader2, Phone, Mail, Tag, MessageSquare } from "lucide-react"
import { useAuth } from "@/context/Auth"
import { AlertModal } from "@/components/alert-modal"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { multiIndicationSchema, MultiIndicationSchema } from "@/lib/validationSchemas"
import { 
  submitMultipleIndications, 
  getSubmitResultMessage,
  Product,
  IndicationItem 
} from "@/services/indication/multi-indication"

export default function IndicarMultiplosPage() {
  const router = useRouter()
  const { userData } = useAuth()
  const [indicationsList, setIndicationsList] = useState<IndicationItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ title: "", description: "" })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [indexToRemove, setIndexToRemove] = useState<number | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue: setFormValue,
  } = useForm<MultiIndicationSchema>({
    resolver: zodResolver(multiIndicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      product: "",
      observations: "",
    },
  })

  // Verifica se o usuário tem permissão para acessar esta página
  useEffect(() => {
    if (userData && userData.rule === "nao_definida") {
      setAlertMessage({
        title: "Cadastro Pendente",
        description: "Seu cadastro ainda não foi aprovado pela unidade. Aguarde a aprovação para poder fazer indicações.",
      })
      setShowAlertModal(true)
      
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    }
  }, [userData, router])

  // Carregar produtos estáticos
  useEffect(() => {
    setProducts([
      { name: "Seguro" },
      { name: "Consórcio" },
      { name: "Plano de Saúde" },
    ])
    setIsLoadingProducts(false)
  }, [])

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    const limited = numbers.slice(0, 11)
    
    if (limited.length <= 2) {
      return limited
    } else if (limited.length <= 7) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
    }
  }

  const addToList = (data: MultiIndicationSchema) => {
    if (!consentChecked) {
      setAlertMessage({
        title: "Consentimento obrigatório",
        description: "Para adicionar um convite, você deve confirmar que obteve autorização verbal prévia do indicado.",
      })
      setShowAlertModal(true)
      return
    }

    if (editingIndex !== null) {
      // Editando uma indicação existente
      const updatedList = [...indicationsList]
      updatedList[editingIndex] = { ...data, id: updatedList[editingIndex].id }
      setIndicationsList(updatedList)
      setEditingIndex(null)
    } else {
      // Adicionando nova indicação
      const newIndication: IndicationItem = {
        ...data,
        id: Date.now().toString(),
      }
      setIndicationsList([...indicationsList, newIndication])
    }

    reset()
    setConsentChecked(false)
  }

  const editIndication = (index: number) => {
    const indication = indicationsList[index]
    setFormValue("fullName", indication.fullName)
    setFormValue("email", indication.email)
    setFormValue("phone", indication.phone)
    setFormValue("product", indication.product)
    setFormValue("observations", indication.observations || "")
    setConsentChecked(true)
    setEditingIndex(index)
    
    // Scroll para o formulário no mobile
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const confirmRemoveIndication = () => {
    if (indexToRemove !== null) {
      const updatedList = indicationsList.filter((_, i) => i !== indexToRemove)
      setIndicationsList(updatedList)
      setIndexToRemove(null)
    }
    setShowRemoveModal(false)
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    reset()
    setConsentChecked(false)
  }

  const submitAllIndications = async () => {
    if (indicationsList.length === 0) {
      setAlertMessage({
        title: "Atenção",
        description: "Adicione pelo menos um convite antes de enviar.",
      })
      setShowAlertModal(true)
      return
    }

    try {
      setIsSubmitting(true)

      if (!userData) {
        throw new Error("Dados do usuário não disponíveis")
      }

      const result = await submitMultipleIndications(indicationsList, {
        uid: userData.uid,
        displayName: userData.displayName,
        profilePicture: userData.profilePicture,
        affiliated_to: userData.affiliated_to,
        unitName: userData.unitName,
      })

      const message = getSubmitResultMessage(
        result.successCount,
        result.errorCount,
        indicationsList.length
      )

      setAlertMessage({
        title: message.title,
        description: message.description,
      })
      setShowAlertModal(true)

      // Se todos foram enviados com sucesso, limpar lista
      if (result.successCount === indicationsList.length) {
        setIndicationsList([])
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else if (result.successCount > 0) {
        // Se alguns falharam, manter apenas os que falharam na lista
        setIndicationsList(
          indicationsList.filter((indication) => {
            return result.errors.some((error) => error.includes(indication.fullName))
          })
        )
      }
    } catch (error: any) {
      setAlertMessage({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
      })
      setShowAlertModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Sidebar apenas para Desktop */}
      <div className="hidden lg:block">
        <DesktopSidebar />
      </div>

      <PageContainer showHeader={true}>
        {/* Background - Desktop com cor sólida */}
        <div className="hidden lg:block">
          <PageBackground />
        </div>

        {/* Background - Mobile com imagem bg_dark_responsive */}
        <div className="lg:hidden fixed inset-0 z-0">
          <div className="absolute inset-0 bg-dark-responsive" />
        </div>

        {/* MOBILE VERSION */}
        <div className="lg:hidden min-h-screen relative pb-24">
          <div className="relative z-10 p-6">
            <div className="mb-6 flex items-center justify-between">
              <BackButton />
              {indicationsList.length > 0 && (
                <button
                  onClick={submitAllIndications}
                  disabled={isSubmitting}
                  className="bg-[#29F3DF] hover:bg-[#29F3DF]/90 text-[#170138] font-bold py-2 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar ({indicationsList.length})
                    </>
                  )}
                </button>
              )}
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-8">Indicar Múltiplos</h1>

            {/* Card de Nova Indicação */}
            <div className="bg-[#4A04A5]/40 rounded-3xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#29F3DF]/20 flex items-center justify-center">
                  {editingIndex !== null ? (
                    <Edit className="w-6 h-6 text-[#29F3DF]" />
                  ) : (
                    <UserPlus className="w-6 h-6 text-[#29F3DF]" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingIndex !== null ? "Editar Convite" : "Novo Convite"}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {editingIndex !== null ? "Modifique os dados do convite" : "Preencha os dados abaixo"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(addToList)} className="space-y-4">
                {/* Nome Completo */}
                <div>
                  <Controller
                    name="fullName"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Nome Completo"
                        className={`w-full border-2 ${
                          errors.fullName ? "border-red" : "border-[#29F3DF]"
                        } text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 bg-transparent`}
                      />
                    )}
                  />
                  {errors.fullName && (
                    <p className="text-red text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                {/* E-mail */}
                <div>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        placeholder="E-mail (opcional)"
                        className={`w-full border-2 ${
                          errors.email ? "border-red" : "border-[#29F3DF]"
                        } text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 bg-transparent`}
                      />
                    )}
                  />
                  {errors.email && (
                    <p className="text-red text-sm mt-1">{errors.email.message}</p>
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
                        onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                        className={`w-full border-2 ${
                          errors.phone ? "border-red" : "border-[#29F3DF]"
                        } text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 bg-transparent`}
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="text-red text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Produto */}
                <div className="relative">
                  <Controller
                    name="product"
                    control={control}
                    render={({ field }) => (
                      <>
                        <select
                          {...field}
                          disabled={isLoadingProducts}
                          className={`w-full border-2 ${
                            errors.product ? "border-red" : "border-[#29F3DF]"
                          } text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 appearance-none bg-transparent ${
                            isLoadingProducts ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <option value="" disabled className="bg-[#170138]">
                            {isLoadingProducts ? "Carregando produtos..." : "Selecione um produto"}
                          </option>
                          {products.map((product) => (
                            <option 
                              key={product.id || product.name} 
                              value={product.name} 
                              className="bg-[#170138]"
                            >
                              {product.name}
                            </option>
                          ))}
                        </select>
                        {isLoadingProducts ? (
                          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5 animate-spin" />
                        ) : (
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5 pointer-events-none" />
                        )}
                      </>
                    )}
                  />
                  {errors.product && (
                    <p className="text-red text-sm mt-1">{errors.product.message}</p>
                  )}
                </div>

                {/* Observações */}
                <div>
                  <Controller
                    name="observations"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        placeholder="Observações (Opcional)"
                        className="w-full border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 min-h-[100px] resize-none bg-transparent"
                      />
                    )}
                  />
                </div>

                {/* Checkbox de consentimento */}
                <div className="flex items-start gap-3 bg-[#4A04A5]/30 p-3 rounded-xl">
                  <input
                    type="checkbox"
                    id="consent-mobile"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-2 border-[#29F3DF] bg-transparent checked:bg-[#29F3DF] checked:border-[#29F3DF] cursor-pointer"
                  />
                  <label htmlFor="consent-mobile" className="text-white text-xs cursor-pointer leading-relaxed">
                    <span className="font-bold">DECLARO que obtive autorização verbal prévia</span> do contato para compartilhar seus dados.
                  </label>
                </div>

                {/* Botões */}
                <div className="flex gap-3">
                  {editingIndex !== null && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 bg-gray/30 hover:bg-gray/40 text-white font-bold py-4 px-6 rounded-2xl transition-colors border border-gray"
                    >
                      CANCELAR
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!consentChecked || isLoadingProducts}
                    className="flex-1 bg-[#C352F2]/30 hover:bg-[#C352F2]/40 text-white font-bold py-4 px-6 rounded-2xl transition-colors border border-[#C352F2] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingIndex !== null ? "SALVAR" : "ADICIONAR"}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de Indicações Adicionadas */}
            {indicationsList.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">
                  Indicações Preparadas ({indicationsList.length})
                </h3>
                {indicationsList.map((ind, index) => (
                  <div key={ind.id} className="bg-[#4A04A5]/40 rounded-2xl p-4 border border-white/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-[#29F3DF] text-lg">{ind.fullName}</h4>
                        <div className="bg-[#29F3DF]/20 px-2 py-1 rounded-full inline-block mt-1">
                          <p className="text-[#29F3DF] text-xs font-medium">#{index + 1}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editIndication(index)}
                          className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => {
                            setIndexToRemove(index)
                            setShowRemoveModal(true)
                          }}
                          className="w-9 h-9 rounded-lg bg-red/20 hover:bg-red/30 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-white/60" />
                        <p className="text-sm text-white/80">{ind.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-white/60" />
                        <p className="text-sm text-white/80">{ind.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#29F3DF]" />
                        <p className="text-sm text-[#29F3DF] font-medium">{ind.product}</p>
                      </div>
                      {ind.observations && (
                        <div className="flex items-start gap-2 mt-2">
                          <MessageSquare className="w-4 h-4 text-white/60 mt-0.5" />
                          <p className="text-sm text-white/60 flex-1">{ind.observations}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Botão de enviar no mobile */}
                <div className="mt-6">
                  <button
                    onClick={submitAllIndications}
                    disabled={isSubmitting}
                    className="w-full bg-[#29F3DF] hover:bg-[#29F3DF]/90 text-[#170138] font-bold py-4 px-6 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        ENVIANDO {indicationsList.length} CONVITE{indicationsList.length > 1 ? "S" : ""}...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        ENVIAR {indicationsList.length} CONVITE{indicationsList.length > 1 ? "S" : ""}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#4A04A5]/40 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#29F3DF]/20 flex items-center justify-center">
                  <Users className="w-8 h-8 text-[#29F3DF]" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  Nenhuma indicação adicionada
                </h4>
                <p className="text-sm text-white/70">
                  Preencha o formulário acima para adicionar suas primeiras indicações
                </p>
              </div>
            )}
          </div>

          <BottomNav />
        </div>

        {/* DESKTOP VERSION */}
        <div className="hidden lg:block relative z-10 min-h-screen">
          <div className="px-8 py-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">Indicar Múltiplos</h1>
                <p className="text-sm text-black dark:text-gray mt-1">
                  Adicione várias indicações e envie diretamente
                </p>
              </div>
              {indicationsList.length > 0 && (
                <button
                  onClick={submitAllIndications}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#29F3DF] to-[#29F3DF]/80 hover:from-[#29F3DF]/90 hover:to-[#29F3DF]/70 text-[#170138] font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Enviar Todas ({indicationsList.length})
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Formulário - 7 colunas */}
              <div className="col-span-7">
                <div className="bg-white dark:bg-[#190d26] border border-gray dark:border-[#4A04A5]/30 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#29F3DF]/20 to-[#29F3DF]/5 flex items-center justify-center">
                      {editingIndex !== null ? (
                        <Edit className="w-6 h-6 text-[#29F3DF]" />
                      ) : (
                        <UserPlus className="w-6 h-6 text-[#29F3DF]" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-black dark:text-white">
                        {editingIndex !== null ? "Editar Indicação" : "Nova Indicação"}
                      </h2>
                      <p className="text-sm text-black dark:text-gray">
                        {editingIndex !== null ? "Modifique os dados abaixo" : "Preencha os dados abaixo"}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(addToList)} className="space-y-5">
                    {/* Nome Completo */}
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray mb-2">
                        Nome Completo
                      </label>
                      <Controller
                        name="fullName"
                        control={control}
                        render={({ field }) => (
                          <>
                            <input
                              {...field}
                              type="text"
                              placeholder="Digite o nome completo"
                              className={`w-full border-2 ${
                                errors.fullName ? "border-red" : "border-gray dark:border-[#4A04A5]"
                              } bg-white dark:bg-[#190d26] text-black dark:text-white placeholder:text-gray dark:placeholder:text-gray px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20`}
                            />
                            {errors.fullName && (
                              <p className="text-red text-sm mt-1">{errors.fullName.message}</p>
                            )}
                          </>
                        )}
                      />
                    </div>

                    {/* E-mail */}
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray mb-2">
                        E-mail (Opcional)
                      </label>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <>
                            <input
                              {...field}
                              type="email"
                              placeholder="email@exemplo.com (opcional)"
                              className={`w-full border-2 ${
                                errors.email ? "border-red" : "border-gray dark:border-[#4A04A5]"
                              } bg-white dark:bg-[#190d26] text-black dark:text-white placeholder:text-gray dark:placeholder:text-gray px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20`}
                            />
                            {errors.email && (
                              <p className="text-red text-sm mt-1">{errors.email.message}</p>
                            )}
                          </>
                        )}
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray mb-2">
                        Telefone
                      </label>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <>
                            <input
                              {...field}
                              type="tel"
                              placeholder="(00) 00000-0000"
                              onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                              className={`w-full border-2 ${
                                errors.phone ? "border-red" : "border-gray dark:border-[#4A04A5]"
                              } bg-white dark:bg-[#190d26] text-black dark:text-white placeholder:text-gray dark:placeholder:text-gray px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20`}
                            />
                            {errors.phone && (
                              <p className="text-red text-sm mt-1">{errors.phone.message}</p>
                            )}
                          </>
                        )}
                      />
                    </div>

                    {/* Produto */}
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray mb-2">
                        Produto
                      </label>
                      <div className="relative">
                        <Controller
                          name="product"
                          control={control}
                          render={({ field }) => (
                            <>
                              <select
                                {...field}
                                disabled={isLoadingProducts}
                                className={`w-full border-2 ${
                                  errors.product ? "border-red" : "border-gray dark:border-[#4A04A5]"
                                } bg-white dark:bg-[#190d26] text-black dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 appearance-none ${
                                  isLoadingProducts ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              >
                                <option value="" disabled>
                                  {isLoadingProducts ? "Carregando produtos..." : "Selecione um produto"}
                                </option>
                                {products.map((product) => (
                                  <option key={product.id || product.name} value={product.name}>
                                    {product.name}
                                  </option>
                                ))}
                              </select>
                              {isLoadingProducts ? (
                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-black dark:text-gray w-5 h-5 animate-spin" />
                              ) : (
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black dark:text-gray w-5 h-5 pointer-events-none" />
                              )}
                              {errors.product && (
                                <p className="text-red text-sm mt-1">{errors.product.message}</p>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </div>

                    {/* Observações */}
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray mb-2">
                        Observações (Opcional)
                      </label>
                      <Controller
                        name="observations"
                        control={control}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            placeholder="Adicione informações relevantes..."
                            className="w-full border-2 border-gray dark:border-[#4A04A5] bg-white dark:bg-[#190d26] text-black dark:text-white placeholder:text-gray dark:placeholder:text-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 min-h-[100px] resize-none"
                          />
                        )}
                      />
                    </div>

                    {/* Checkbox */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#4A04A5]/10 rounded-xl">
                      <input
                        type="checkbox"
                        id="consent-desktop"
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-2 border-[#29F3DF] bg-transparent checked:bg-[#29F3DF] checked:border-[#29F3DF] cursor-pointer"
                      />
                      <label htmlFor="consent-desktop" className="text-black dark:text-gray text-sm cursor-pointer leading-relaxed">
                        <span className="font-bold">DECLARO que obtive autorização verbal prévia</span> do indicado para compartilhar seus dados.
                      </label>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3">
                      {editingIndex !== null && (
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-black dark:text-white font-bold py-4 px-6 rounded-xl transition-all"
                        >
                          CANCELAR
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={!consentChecked || isLoadingProducts}
                        className="flex-1 bg-gradient-to-r from-[#C352F2] to-[#C352F2]/80 hover:from-[#C352F2]/90 hover:to-[#C352F2]/70 text-white font-bold py-4 px-6 rounded-xl transition-all text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserPlus className="w-5 h-5" />
                        {editingIndex !== null ? "SALVAR ALTERAÇÕES" : "ADICIONAR À LISTA"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Lista de Indicações - 5 colunas */}
              <div className="col-span-5">
                <div className="bg-white dark:bg-[#190d26] border border-gray dark:border-[#4A04A5]/30 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C352F2]/20 to-[#C352F2]/5 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#C352F2]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-black dark:text-white">Lista de Indicações</h3>
                        <p className="text-xs text-black dark:text-gray">
                          {indicationsList.length} {indicationsList.length === 1 ? "indicação" : "indicações"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {indicationsList.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#C352F2]/10 to-[#C352F2]/5 flex items-center justify-center">
                        <Users className="w-8 h-8 text-[#C352F2]" />
                      </div>
                      <h4 className="text-base font-bold text-black dark:text-white mb-2">
                        Nenhuma indicação adicionada
                      </h4>
                      <p className="text-sm text-black dark:text-gray">
                        Preencha o formulário ao lado para adicionar indicações
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {indicationsList.map((ind, index) => (
                        <div
                          key={ind.id}
                          className="bg-gradient-to-r from-[#4A04A5]/10 to-transparent border border-[#4A04A5]/20 rounded-xl p-4 hover:from-[#4A04A5]/20 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-[#29F3DF] text-base mb-1 truncate">{ind.fullName}</h4>
                              <div className="bg-[#29F3DF]/20 px-2 py-1 rounded-full inline-block">
                                <p className="text-[#29F3DF] text-xs font-medium">#{index + 1}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-3">
                              <button
                                onClick={() => editIndication(index)}
                                className="w-8 h-8 rounded-lg bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                              >
                                <Edit className="w-4 h-4 text-black dark:text-white" />
                              </button>
                              <button
                                onClick={() => {
                                  setIndexToRemove(index)
                                  setShowRemoveModal(true)
                                }}
                                className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-black dark:text-gray" />
                              <p className="text-sm text-black dark:text-gray truncate">{ind.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-black dark:text-gray" />
                              <p className="text-sm text-black dark:text-gray">{ind.phone}</p>
                            </div>
                            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-[#C352F2]/20 border border-[#C352F2]/30">
                              <p className="text-xs font-medium text-[#C352F2]">{ind.product}</p>
                            </div>
                            {ind.observations && (
                              <div className="flex items-start gap-2 mt-2 pt-2 border-t border-black/10 dark:border-white/10">
                                <MessageSquare className="w-4 h-4 text-black dark:text-gray mt-0.5" />
                                <p className="text-xs text-black dark:text-gray flex-1">{ind.observations}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {indicationsList.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray dark:border-[#4A04A5]/30">
                      <button
                        onClick={submitAllIndications}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#29F3DF] to-[#29F3DF]/80 hover:from-[#29F3DF]/90 hover:to-[#29F3DF]/70 text-[#170138] font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Enviar {indicationsList.length} {indicationsList.length === 1 ? "Indicação" : "Indicações"}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Modal de Confirmação de Remoção */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRemoveModal(false)}
          />
          
          <div className="relative w-full max-w-md bg-fifth-purple dark:bg-purple-black border-2 border-blue rounded-3xl p-6 mx-auto">
            <h3 className="text-blue font-bold text-2xl text-center mb-4">
              Remover Convite
            </h3>

            <p className="text-white/70 text-sm text-center mb-6 leading-relaxed">
              Tem certeza que deseja remover este convite da lista?
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="bg-white hover:bg-gray-100 text-fifth-purple dark:text-purple-black font-bold py-3 px-8 rounded-xl transition-colors"
              >
                CANCELAR
              </button>
              <button
                onClick={confirmRemoveIndication}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
              >
                REMOVER
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
  )
}
