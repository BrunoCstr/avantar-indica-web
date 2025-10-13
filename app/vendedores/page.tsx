"use client"

import { useState, useEffect, useCallback } from "react"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { Search, UserPlus, Edit, CheckCircle, XCircle, User, Eye, EyeOff, ChevronLeft } from "lucide-react"
import { useAuth } from "@/context/Auth"
import {
  fetchSellersService,
  createSellerService,
  updateSellerService,
  toggleSellerActiveService,
  Seller,
} from "@/services/sellers/sellers"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { validatePassword } from "@/utils/validatePassword"
import { applyMaskTelephone, removePhoneMask } from "@/utils/applyMaskTelephone"
import { getDefaultProfilePicture } from "@/utils/getDefaultProfilePicture"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/Spinner"
import { useRouter } from "next/navigation"

// Schema de validação para cadastro de vendedor
const sellerSignUpSchema = z
  .object({
    fullName: z.string().min(3, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    phone: z
      .string()
      .min(14, "Digite um telefone válido!")
      .max(15, "Digite um telefone válido!")
      .regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, "Formato de telefone inválido!"),
    password: z.string().min(1, "Senha é obrigatória"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    commission: z
      .number()
      .min(0, "Comissão deve ser entre 0 e 100")
      .max(100, "Comissão deve ser entre 0 e 100")
      .optional()
      .nullable(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas devem ser iguais!",
    path: ["confirmPassword"],
  })

// Schema de validação para edição de vendedor (senha opcional)
const sellerEditSchema = z
  .object({
    fullName: z.string().min(3, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    phone: z
      .string()
      .min(14, "Digite um telefone válido!")
      .max(15, "Digite um telefone válido!")
      .regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, "Formato de telefone inválido!"),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    commission: z
      .number()
      .min(0, "Comissão deve ser entre 0 e 100")
      .max(100, "Comissão deve ser entre 0 e 100")
      .optional()
      .nullable(),
  })
  .refine((data) => {
    if (data.password && data.password !== "") {
      return data.password === (data.confirmPassword ?? "")
    }
    return true
  }, {
    message: "As senhas devem ser iguais!",
    path: ["confirmPassword"],
  })

type SellerCreateFormData = z.infer<typeof sellerSignUpSchema>
type SellerEditFormData = z.infer<typeof sellerEditSchema>

export default function VendedoresPage() {
  const { userData } = useAuth()
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [vendedores, setVendedores] = useState<Seller[]>([])
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState({
    title: "",
    description: "",
  })
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoadingRegister, setIsLoadingRegister] = useState(false)
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [isLoadingToggle, setIsLoadingToggle] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Formulário de criação
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SellerCreateFormData>({
    resolver: zodResolver(sellerSignUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      commission: undefined,
    },
  })

  // Formulário de edição
  const {
    control: controlEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    watch: watchEdit,
  } = useForm<SellerEditFormData>({
    resolver: zodResolver(sellerEditSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      commission: undefined,
    },
  })

  // Verificar permissões
  useEffect(() => {
    if (
      userData &&
      !["parceiro_indicador", "admin_franqueadora", "admin_unidade"].includes(userData.rule)
    ) {
      router.push("/dashboard")
    }
  }, [userData, router])

  // Carregar vendedores
  useEffect(() => {
    if (userData?.uid) {
      fetchSellers()
    }
  }, [userData?.uid])

  // Filtrar vendedores
  useEffect(() => {
    if (busca.trim() === "") {
      setFilteredSellers(vendedores)
    } else {
      setFilteredSellers(
        vendedores.filter((seller) =>
          seller.fullName.toLowerCase().includes(busca.toLowerCase())
        )
      )
    }
  }, [busca, vendedores])

  async function fetchSellers() {
    if (!userData?.uid) return
    setIsLoading(true)
    try {
      const sellersList = await fetchSellersService(userData.uid)
      setVendedores(sellersList)
      setFilteredSellers(sellersList)
    } catch (error) {
      console.error("Erro ao buscar vendedores:", error)
      setModalMessage({
        title: "Erro",
        description: "Não foi possível carregar os vendedores.",
      })
      setIsModalVisible(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Função do Pull Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchSellers()
    } catch (error) {
      console.error("Erro ao atualizar vendedores:", error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    const names = name.split(" ")
    const initials = names.map((n) => n[0]).join("")
    return initials.substring(0, 2).toUpperCase()
  }

  // Criar vendedor
  async function onSubmit(data: SellerCreateFormData) {
    setIsLoadingRegister(true)
    try {
      const { fullName, email, phone, password, commission } = data

      // Validar força da senha
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        setModalMessage({
          title: "Senha fraca",
          description: passwordValidation.message,
        })
        setIsModalVisible(true)
        setIsLoadingRegister(false)
        return
      }

      const profilePicture = await getDefaultProfilePicture()

      // Remove a máscara do telefone antes de salvar
      const phoneWithoutMask = removePhoneMask(phone)
      await createSellerService({
        fullName,
        email,
        phone: phoneWithoutMask,
        password,
        commission: commission || undefined,
        affiliated_to: userData?.affiliated_to,
        unitName: userData?.unitName,
        profilePicture: profilePicture || undefined,
        masterUid: userData?.uid,
      })
      setShowCreateModal(false)
      reset()
      setShowPassword(false)
      setShowConfirmPassword(false)
      setModalMessage({
        title: "Vendedor cadastrado!",
        description: "O vendedor foi cadastrado com sucesso.",
      })
      setIsModalVisible(true)
      fetchSellers()
    } catch (error: any) {
      setModalMessage({
        title: "Erro ao cadastrar",
        description: error.message || "Não foi possível cadastrar o vendedor.",
      })
      setIsModalVisible(true)
    } finally {
      setIsLoadingRegister(false)
    }
  }

  // Editar vendedor
  async function onSubmitEdit(data: SellerEditFormData) {
    if (!editingSeller) return
    setIsLoadingEdit(true)
    try {
      const { fullName, email, phone, password, commission } = data

      // Se a senha foi alterada (não é ''), validar força da senha
      if (password && password !== "") {
        const passwordValidation = validatePassword(password)
        if (!passwordValidation.isValid) {
          setModalMessage({
            title: "Senha fraca",
            description: passwordValidation.message,
          })
          setIsModalVisible(true)
          setIsLoadingEdit(false)
          return
        }
      }

      // Remove a máscara do telefone antes de salvar
      const phoneWithoutMask = removePhoneMask(phone)

      await updateSellerService({
        sellerId: editingSeller.id,
        fullName,
        email,
        phone: phoneWithoutMask,
        password: password !== "" ? password : undefined,
        oldEmail: editingSeller.email,
        commission: commission || undefined,
      })
      setShowEditModal(false)
      resetEdit()
      setEditingSeller(null)
      setShowPassword(false)
      setShowConfirmPassword(false)
      setModalMessage({
        title: "Vendedor atualizado!",
        description: "O vendedor foi atualizado com sucesso.",
      })
      setIsModalVisible(true)
      fetchSellers()
    } catch (error: any) {
      setModalMessage({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o vendedor.",
      })
      setIsModalVisible(true)
    } finally {
      setIsLoadingEdit(false)
    }
  }

  // Abrir modal de edição
  function handleEdit(seller: Seller) {
    setEditingSeller(seller)
    resetEdit({
      fullName: seller.fullName || "",
      email: seller.email || "",
      phone: seller.phone ? applyMaskTelephone(seller.phone) : "",
      password: "",
      confirmPassword: "",
      commission: seller.commission || undefined,
    })
    setShowEditModal(true)
  }

  // Ativar/Desativar vendedor
  async function handleToggleActiveConfirmed() {
    if (!selectedSeller) return
    setIsLoadingToggle(true)
    try {
      await toggleSellerActiveService(
        selectedSeller.id,
        selectedSeller.disabled,
        selectedSeller.email
      )
      fetchSellers()
      setConfirmModalVisible(false)
      setSelectedSeller(null)
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      setModalMessage({
        title: "Erro",
        description: "Não foi possível atualizar o status do vendedor.",
      })
      setIsModalVisible(true)
      setConfirmModalVisible(false)
      setSelectedSeller(null)
    } finally {
      setIsLoadingToggle(false)
    }
  }

  const vendedoresFiltrados = filteredSellers

  return (
    <>
      <DesktopSidebar />

      <PageContainer className="pb-24 lg:pb-0">
        {/* Background - Mobile: bg roxo com pattern | Desktop: cor sólida do tema */}
        <div className="lg:hidden fixed inset-0 bg-dark-responsive">
          {/* Pattern background - apenas mobile */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(41, 243, 223, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 80% 80%, rgba(195, 82, 242, 0.3) 0%, transparent 50%)`,
              }}
            />
          </div>
        </div>
        <div className="hidden lg:block">
          <PageBackground />
        </div>

        <div className="relative z-10 p-6 lg:px-8 lg:py-6">
          <div className="mb-6 flex items-center justify-between lg:border-b lg:border-gray dark:lg:border-white/10 lg:pb-6">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <BackButton />
              </div>
              <h1 className="text-3xl font-bold text-white lg:text-black lg:dark:text-white">Vendedores</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-12 h-12 rounded-xl border-2 border-[#29F3DF] text-[#29F3DF] hover:bg-[#29F3DF]/10 flex items-center justify-center transition-colors lg:border-[#4A04A5] lg:text-[#4A04A5] lg:hover:bg-[#4A04A5]/10 lg:dark:border-[#29F3DF] lg:dark:text-[#29F3DF] lg:dark:hover:bg-[#29F3DF]/10"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 lg:max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 lg:text-black lg:dark:text-white/80" />
              <input
                type="text"
                placeholder="Pesquisar por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-[#170138] border-b-4 border-l-4 border-[#C352F2] text-white placeholder:text-white/60 pl-12 pr-4 py-4 rounded-2xl focus:outline-none lg:bg-white lg:border-gray-300 lg:text-black lg:placeholder:text-black lg:focus:ring-[#4A04A5]/50 lg:focus:border-[#4A04A5] lg:dark:bg-[#170138] lg:dark:border-[#C352F2] lg:dark:text-white lg:dark:placeholder:text-white/60"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-[#190d26] border border-gray-100 dark:border-tertiary-purple rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#4A04A5] text-white dark:bg-[#4A04A5] dark:text-white">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold">Vendedor</th>
                  <th className="text-left py-4 px-6 font-semibold">Email</th>
                  <th className="text-left py-4 px-6 font-semibold">Comissão</th>
                  <th className="text-left py-4 px-6 font-semibold">Status</th>
                  <th className="text-right py-4 px-6 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <div className="flex justify-center">
                        <Spinner variant="blue" />
                      </div>
                    </td>
                  </tr>
                ) : vendedoresFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Nenhum vendedor encontrado
                    </td>
                  </tr>
                ) : (
                  vendedoresFiltrados.map((vendedor, index) => (
                    <tr
                      key={vendedor.id}
                      className={`border-b border-gray-100 dark:border-[#4A04A5] hover:bg-gray-50 dark:hover:bg-[#4A04A5]/10 ${
                        index % 2 === 0 ? "bg-white dark:bg-[#190d26]" : "bg-gray-50/50 dark:bg-[#190d26]/50"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {vendedor.profilePicture ? (
                            <img
                              src={vendedor.profilePicture}
                              alt={vendedor.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#29F3DF] to-[#C352F2] p-0.5 flex-shrink-0">
                              <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                  {getInitials(vendedor.fullName)}
                                </span>
                              </div>
                            </div>
                          )}
                          <span className="font-bold text-[#4A04A5] dark:text-white">{vendedor.fullName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-black dark:text-gray">{vendedor.email}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-blue-600 dark:text-[#29F3DF] font-bold">
                          {vendedor.commission || 0}%
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                            vendedor.disabled
                              ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                              : "bg-green dark:bg-green-900/30 text-black dark:text-black"
                          }`}
                        >
                          {vendedor.disabled ? "Inativo" : "Ativo"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(vendedor)}
                            className="w-10 h-10 rounded-xl bg-[#4A04A5]/10 hover:bg-[#4A04A5]/20 dark:bg-[#4A04A5]/20 dark:hover:bg-[#4A04A5]/30 flex items-center justify-center transition-colors"
                          >
                            <Edit className="w-5 h-5 text-[#4A04A5] dark:text-[#29F3DF]" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSeller(vendedor)
                              setConfirmModalVisible(true)
                            }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                              vendedor.disabled
                                ? "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                                : "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                            }`}
                          >
                            {vendedor.disabled ? (
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red dark:text-red" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="lg:hidden space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <Spinner />
              </div>
            ) : vendedoresFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-white/60" />
                </div>
                <p className="text-white/80 mb-4">Nenhum vendedor cadastrado</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-xl border-2 border-[#29F3DF] text-[#29F3DF] hover:bg-[#29F3DF]/10 transition-colors"
                >
                  Cadastrar novo vendedor
                </button>
              </div>
            ) : (
              vendedoresFiltrados.map((vendedor) => (
                <div key={vendedor.id} className="bg-white rounded-2xl p-5 shadow-md">
                  <div className="flex items-start gap-4">
                    {vendedor.profilePicture ? (
                      <img
                        src={vendedor.profilePicture}
                        alt={vendedor.fullName}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#29F3DF] to-[#C352F2] p-0.5 flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">
                            {getInitials(vendedor.fullName)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#4A04A5] text-lg mb-1">{vendedor.fullName}</h3>
                          <p className="text-sm text-gray-600 truncate">{vendedor.email}</p>
                        </div>
                        <span
                          className={`ml-2 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                            vendedor.disabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {vendedor.disabled ? "Inativo" : "Ativo"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-sm text-blue-600 font-bold">Comissão: {vendedor.commission || 0}%</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(vendedor)}
                            className="w-10 h-10 rounded-xl bg-[#4A04A5]/10 hover:bg-[#4A04A5]/20 flex items-center justify-center transition-colors"
                          >
                            <Edit className="w-5 h-5 text-[#4A04A5]" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSeller(vendedor)
                              setConfirmModalVisible(true)
                            }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                              vendedor.disabled ? "bg-green-50 hover:bg-green-100" : "bg-red-50 hover:bg-red-100"
                            }`}
                          >
                            {vendedor.disabled ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <BottomNav />
      </PageContainer>

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#190d26] rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  reset()
                  setShowPassword(false)
                  setShowConfirmPassword(false)
                }}
                className="w-8 h-8 flex items-center justify-center rounded-sm border-2 border-[#29F3DF] text-[#29F3DF] lg:border-[#4A04A5] lg:text-[#4A04A5] lg:dark:border-[#29F3DF] lg:dark:text-[#29F3DF] hover:opacity-80 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-[#4A04A5] dark:text-white">Cadastrar</h2>
              <div className="w-8"></div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Nome completo"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.fullName
                          ? "border-red-500"
                          : "border-gray-300 dark:border-[#4A04A5]"
                      } bg-white dark:bg-[#170138] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60`}
                    />
                  )}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      placeholder="E-mail"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.email ? "border-red-500" : "border-gray-300 dark:border-[#4A04A5]"
                      } bg-white dark:bg-[#170138] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60`}
                    />
                  )}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="tel"
                      placeholder="Telefone"
                      value={field.value}
                      onChange={(e) => field.onChange(applyMaskTelephone(e.target.value))}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.phone ? "border-red-500" : "border-gray-300 dark:border-[#4A04A5]"
                      } bg-white dark:bg-[#170138] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60`}
                    />
                  )}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <Controller
                  control={control}
                  name="commission"
                  render={({ field }) => (
                    <input
                      type="number"
                      placeholder="Comissão (%)"
                      value={field.value === null || field.value === undefined ? "" : field.value}
                      onChange={(e) => {
                        const val = e.target.value === "" ? undefined : parseFloat(e.target.value)
                        field.onChange(val)
                      }}
                      min="0"
                      max="100"
                      step="0.01"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.commission ? "border-red-500" : "border-gray-300 dark:border-[#4A04A5]"
                      } bg-white dark:bg-[#170138] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60`}
                    />
                  )}
                />
                {errors.commission && (
                  <p className="text-red-500 text-xs mt-1">{errors.commission.message}</p>
                )}
              </div>

              <div className="relative">
                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Senha"
                      className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                        errors.password ? "border-red-500" : "border-gray-300 dark:border-[#4A04A5]"
                      } bg-white dark:bg-[#170138] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60`}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-white/60 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="relative">
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar senha"
                      className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300 dark:border-[#4A04A5]"
                      } bg-white dark:bg-[#170138] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60`}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-white/60 dark:hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    reset()
                    setShowPassword(false)
                    setShowConfirmPassword(false)
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-[#4A04A5] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4A04A5]/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoadingRegister}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#4A04A5] text-white hover:bg-[#4A04A5]/90 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {isLoadingRegister ? <Spinner /> : "CADASTRAR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição - Continue lendo o arquivo */}
      {showEditModal && editingSeller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#190d26] rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  resetEdit()
                  setEditingSeller(null)
                  setShowPassword(false)
                  setShowConfirmPassword(false)
                }}
                className="w-8 h-8 flex items-center justify-center rounded-sm border-2 border-[#29F3DF] text-[#29F3DF] lg:border-[#4A04A5] lg:text-[#4A04A5] lg:dark:border-[#29F3DF] lg:dark:text-[#29F3DF] hover:opacity-80 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-[#4A04A5] dark:text-white">Editar</h2>
              <div className="w-8"></div>
            </div>
            <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-4">
              <div>
                <Controller
                  control={controlEdit}
                  name="fullName"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Nome completo"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errorsEdit.fullName
                          ? "border-red-500"
                          : "border-gray-300 dark:border-[#4A04A5]"
                      } bg-white dark:bg-[#170138] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60`}
                    />
                  )}
                />
                {errorsEdit.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errorsEdit.fullName.message}</p>
                )}
              </div>

              <div>
                <Controller
                  control={controlEdit}
                  name="email"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      placeholder="E-mail"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errorsEdit.email ? "border-red-500" : "border-gray-300 dark:border-[#4A04A5]"
                      } bg-white dark:bg-[#170138] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60`}
                    />
                  )}
                />
                {errorsEdit.email && <p className="text-red-500 text-xs mt-1">{errorsEdit.email.message}</p>}
              </div>

              <div>
                <Controller
                  control={controlEdit}
                  name="phone"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="tel"
                      placeholder="Telefone"
                      value={field.value}
                      onChange={(e) => field.onChange(applyMaskTelephone(e.target.value))}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errorsEdit.phone ? "border-red-500" : "border-gray-300 dark:border-[#4A04A5]"
                      } bg-white dark:bg-[#170138] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60`}
                    />
                  )}
                />
                {errorsEdit.phone && <p className="text-red-500 text-xs mt-1">{errorsEdit.phone.message}</p>}
              </div>

              <div>
                <Controller
                  control={controlEdit}
                  name="commission"
                  render={({ field }) => (
                    <input
                      type="number"
                      placeholder="Comissão (%)"
                      value={field.value === null || field.value === undefined ? "" : field.value}
                      onChange={(e) => {
                        const val = e.target.value === "" ? undefined : parseFloat(e.target.value)
                        field.onChange(val)
                      }}
                      min="0"
                      max="100"
                      step="0.01"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errorsEdit.commission ? "border-red-500" : "border-gray-300 dark:border-[#4A04A5]"
                      } bg-white dark:bg-[#170138] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60`}
                    />
                  )}
                />
                {errorsEdit.commission && (
                  <p className="text-red-500 text-xs mt-1">{errorsEdit.commission.message}</p>
                )}
              </div>

              <div className="relative">
                <Controller
                  control={controlEdit}
                  name="password"
                  render={({ field }) => (
                    <input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Nova senha (deixe em branco para não alterar)"
                      className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                        errorsEdit.password ? "border-red-500" : "border-gray-300 dark:border-[#4A04A5]"
                      } bg-white dark:bg-[#170138] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60`}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-white/60 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errorsEdit.password && <p className="text-red-500 text-xs mt-1">{errorsEdit.password.message}</p>}
              </div>

              {watchEdit("password") && (
                <div className="relative">
                  <Controller
                    control={controlEdit}
                    name="confirmPassword"
                    render={({ field }) => (
                      <input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmar nova senha"
                        className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                          errorsEdit.confirmPassword
                            ? "border-red-500"
                            : "border-gray-300 dark:border-[#4A04A5]"
                        } bg-white dark:bg-[#170138] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60`}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-white/60 dark:hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errorsEdit.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errorsEdit.confirmPassword.message}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    resetEdit()
                    setEditingSeller(null)
                    setShowPassword(false)
                    setShowConfirmPassword(false)
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-[#4A04A5] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4A04A5]/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoadingEdit}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#4A04A5] text-white hover:bg-[#4A04A5]/90 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {isLoadingEdit ? <Spinner /> : "SALVAR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Sucesso/Erro */}
      <AlertDialog open={isModalVisible} onOpenChange={setIsModalVisible}>
        <AlertDialogContent className="bg-white dark:bg-[#190d26]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#4A04A5] dark:text-white">{modalMessage.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {modalMessage.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setIsModalVisible(false)}
              className="bg-[#4A04A5] hover:bg-[#4A04A5]/90 text-white"
            >
              FECHAR
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmação de Ativação/Inativação */}
      <AlertDialog open={confirmModalVisible} onOpenChange={setConfirmModalVisible}>
        <AlertDialogContent className="bg-white dark:bg-[#190d26]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#4A04A5] dark:text-white">
              {selectedSeller?.disabled ? "Ativar vendedor" : "Inativar vendedor"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {selectedSeller?.disabled
                ? "Deseja realmente ativar este vendedor?"
                : "Deseja realmente inativar este vendedor?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setConfirmModalVisible(false)
                setSelectedSeller(null)
              }}
              className="border-gray-300 dark:border-[#4A04A5]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleActiveConfirmed}
              disabled={isLoadingToggle}
              className="bg-[#4A04A5] hover:bg-[#4A04A5]/90 text-white"
            >
              {isLoadingToggle ? <Spinner /> : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
