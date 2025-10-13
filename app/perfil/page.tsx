"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { LogOut, User, Phone, CreditCard, Upload } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/Auth"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { db, storage, auth } from "@/lib/firebaseConfig"
import { updateProfile } from "firebase/auth"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { applyMaskTelephone } from "@/utils/applyMaskTelephone"

export default function PerfilPage() {
  const router = useRouter()
  const { userData, isLoading, signOut } = useAuth()
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [isEditingPix, setIsEditingPix] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedPhone, setEditedPhone] = useState("")
  const [editedPixKey, setEditedPixKey] = useState("")
  const [savingUser, setSavingUser] = useState(false)
  const [savingPix, setSavingPix] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleLogout = async () => {
    await signOut()
  }

  useEffect(() => {
    if (!userData?.uid) return
    const unsubscribe = onSnapshot(doc(db, "users", userData.uid), (snap) => {
      const data = snap.data()
      if (data?.profilePicture) setProfilePicture(data.profilePicture)
      if (!isEditingUser) {
        setEditedName(data?.fullName || userData.displayName || "")
        setEditedPhone(applyMaskTelephone(data?.phone || userData.phone || ""))
      }
      if (!isEditingPix) {
        setEditedPixKey(data?.pixKey || "")
      }
    })
    return () => unsubscribe()
  }, [userData?.uid, isEditingUser, isEditingPix])

  async function handleSelectPicture(e: React.ChangeEvent<HTMLInputElement>) {
    if (!userData?.uid) return
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const storageRef = ref(storage, `profile_pictures/${userData.uid}/profile_picture.jpg`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateDoc(doc(db, "users", userData.uid), { profilePicture: url })
      setProfilePicture(url)
    } catch (error) {
      console.error("Erro ao enviar foto de perfil:", error)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function validatePhoneFree(text: string) {
    setEditedPhone(text)
  }

  const isPhoneValid = () => {
    const raw = editedPhone.replace(/\D/g, "")
    return raw.length >= 10 && raw.length <= 11
  }

  const isNameValid = () => editedName.trim().length >= 2

  async function handleSaveUser() {
    if (!userData?.uid) return
    if (!isPhoneValid() || !isNameValid()) return
    setSavingUser(true)
    try {
      const rawPhone = editedPhone.replace(/\D/g, "")
      const promises: Promise<any>[] = []
      if (auth.currentUser && auth.currentUser.displayName !== editedName) {
        promises.push(updateProfile(auth.currentUser, { displayName: editedName }))
      }
      promises.push(
        updateDoc(doc(db, "users", userData.uid), {
          fullName: editedName,
          phone: rawPhone,
        })
      )
      await Promise.all(promises)
      setIsEditingUser(false)
    } catch (error) {
      console.error("Erro ao salvar dados do usuário:", error)
    } finally {
      setSavingUser(false)
    }
  }

  const isPixValid = () => editedPixKey.trim().length === 0 || editedPixKey.trim().length >= 7

  async function handleSavePix() {
    if (!userData?.uid) return
    if (!isPixValid()) return
    setSavingPix(true)
    try {
      const pixValue = editedPixKey.trim() === "" ? null : editedPixKey.trim()
      await updateDoc(doc(db, "users", userData.uid), { pixKey: pixValue })
      setIsEditingPix(false)
    } catch (error) {
      console.error("Erro ao salvar chave pix:", error)
    } finally {
      setSavingPix(false)
    }
  }

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-[#4A04A5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#29F3DF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white mt-4">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DesktopSidebar />

      <PageContainer className="pb-24 lg:pb-8">
        {/* Background - Mobile: bg-white-responsive | Desktop: cor sólida do tema */}
        <div className="lg:hidden">
          <PageBackground className="bg-white-responsive" />
        </div>
        <div className="hidden lg:block">
          <PageBackground />
        </div>

        <div className="relative z-10 p-6">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <BackButton bgColor="purple"/>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-sm border-2 border-red text-red hover:bg-red/10 flex items-center justify-center transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <h1 className="text-3xl font-bold text-black dark:text-white text-center mb-8">Perfil</h1>

          {/* Foto de Perfil */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#29F3DF] to-[#C352F2] p-1">
                <div className="w-full h-full rounded-full bg-[#4A04A5] flex items-center justify-center overflow-hidden">
                  <img
                    src={profilePicture || userData.profilePicture || "/placeholder-user.jpg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#29F3DF] hover:bg-[#29F3DF]/90 flex items-center justify-center shadow-lg transition-colors"
              >
                <Upload className="w-5 h-5 text-[#170138]" />
              </button>
              <input ref={fileInputRef} onChange={handleSelectPicture} type="file" accept="image/*" className="hidden" />
            </div>
          </div>

          {/* Card de Informações */}
          <div className="bg-white rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#4A04A5]">Informações do usuário</h2>
              {isEditingUser ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveUser}
                    disabled={savingUser || !isNameValid() || !isPhoneValid()}
                    className="text-white bg-[#4A04A5] hover:bg-[#4A04A5]/90 font-medium text-sm px-3 py-1 rounded-md disabled:opacity-50"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setIsEditingUser(false)}
                    className="text-[#4A04A5] hover:text-[#29F3DF] font-medium text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditingUser(true)} className="text-[#4A04A5] hover:text-[#29F3DF] font-medium text-sm">Editar</button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#4A04A5]/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#4A04A5]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Nome</p>
                  {isEditingUser ? (
                    <input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${isNameValid() ? "border-gray-300" : "border-red"}`}
                    />
                  ) : (
                    <p className="font-bold text-[#4A04A5]">{userData.displayName}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#4A04A5]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#4A04A5]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Telefone</p>
                  {isEditingUser ? (
                    <input
                      value={editedPhone}
                      onChange={(e) => validatePhoneFree(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${isPhoneValid() ? "border-gray-300" : "border-red"}`}
                    />
                  ) : (
                    <p className="font-bold text-[#4A04A5]">{userData.phone ? applyMaskTelephone(userData.phone) : "Não cadastrado"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card de Pagamento */}
          <div className="bg-white rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#4A04A5]">Dados para pagamento</h2>
              {isEditingPix ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSavePix}
                    disabled={savingPix || !isPixValid()}
                    className="text-white bg-[#4A04A5] hover:bg-[#4A04A5]/90 font-medium text-sm px-3 py-1 rounded-md disabled:opacity-50"
                  >
                    Salvar
                  </button>
                  <button onClick={() => setIsEditingPix(false)} className="text-[#4A04A5] hover:text-[#29F3DF] font-medium text-sm">Cancelar</button>
                </div>
              ) : (
                <button onClick={() => setIsEditingPix(true)} className="text-[#4A04A5] hover:text-[#29F3DF] font-medium text-sm">Editar</button>
              )}
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#4A04A5]/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-[#4A04A5]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Chave pix</p>
                {isEditingPix ? (
                  <input
                    value={editedPixKey}
                    onChange={(e) => setEditedPixKey(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isPixValid() ? "border-gray-300" : "border-red"}`}
                  />
                ) : (
                  <p className="font-bold text-[#4A04A5]">{userData.pixKey || "Não cadastrada"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-4">
            <Link
              href="/configuracoes"
              className="block w-full bg-[#F28907] border-b-4 border-r-4 border-[#E06400] hover:bg-[#F28907]/90 text-white font-bold py-5 px-6 rounded-2xl transition-colors text-lg text-center"
            >
              CONFIGURAÇÕES
            </Link>

            <Link
              href="/vendedores"
              className="block w-full bg-[#29F3DF] border-b-4 border-r-4 border-[#0EC8B5] hover:bg-[#29F3DF]/90 text-[#170138] font-bold py-5 px-6 rounded-2xl transition-colors text-lg text-center"
            >
              VENDEDORES
            </Link>
          </div>
        </div>

        <BottomNav />
      </PageContainer>
    </>
  )
}
