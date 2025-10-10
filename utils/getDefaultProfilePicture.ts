import { storage } from '@/lib/firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';

export async function getDefaultProfilePicture(): Promise<string | null> {
  try {
    const storageRef = ref(storage, 'profile_pictures/default/default_profile_picture.png');
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (err) {
    console.error('Erro ao pegar a imagem de perfil padrão', err);
    return null;
  }
}