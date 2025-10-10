import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  Unsubscribe,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { formatTimeAgo } from '@/utils/formatTimeAgo';

// Tipo unificado para indicações, oportunidades e lotes em massa
export interface UnifiedStatusItem {
  id: string;
  name: string;
  status: string;
  product: string;
  updatedAt: string; // Formatado para exibição
  indicator_id: string;
  createdAt: any;
  updatedAtOriginal: any; // Timestamp original para ordenação
  type: 'indication' | 'opportunity' | 'bulk';
  trash?: boolean;
  archived?: boolean;
  // Campos específicos para lotes em massa
  indications?: any[];
  progress?: number;
  total?: number;
  processed?: number;
  packagedIndicationId?: string;
  unitName?: string;
}

// Tipo para as estatísticas de status
export interface StatusStats {
  [key: string]: number;
}

/**
 * Inscreve-se para receber atualizações em tempo real de indicações, 
 * oportunidades e lotes em massa do Firestore
 */
export function subscribeToStatusItems(
  userId: string,
  onUpdate: (items: UnifiedStatusItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!userId) {
    throw new Error('userId é obrigatório para buscar itens de status');
  }

  let allIndications: UnifiedStatusItem[] = [];
  let allOpportunities: UnifiedStatusItem[] = [];
  let allBulk: UnifiedStatusItem[] = [];

  // Função para atualizar e ordenar todos os itens
  const updateAndSort = () => {
    const all = [...allIndications, ...allOpportunities, ...allBulk];
    
    // Ordena por updatedAtOriginal (mais recente primeiro)
    all.sort((a, b) => {
      const aTime = getTimestamp(a.updatedAtOriginal) || getTimestamp(a.createdAt) || 0;
      const bTime = getTimestamp(b.updatedAtOriginal) || getTimestamp(b.createdAt) || 0;
      return bTime - aTime;
    });

    onUpdate(all);
  };

  // Helper para obter timestamp em milissegundos
  const getTimestamp = (date: any): number => {
    if (!date) return 0;
    
    if (date?.seconds) {
      return date.seconds * 1000;
    }
    
    if (date?.toDate && typeof date.toDate === 'function') {
      return date.toDate().getTime();
    }
    
    if (date instanceof Date) {
      return date.getTime();
    }
    
    return 0;
  };

  try {
    // Query para indicações
    const indicationsRef = collection(db, 'indications');
    const indicationsQuery = query(
      indicationsRef,
      where('indicator_id', '==', userId)
    );

    const unsubIndications = onSnapshot(
      indicationsQuery,
      (snapshot) => {
        allIndications = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || '',
              status: data.status || '',
              product: data.product || '',
              updatedAt: formatTimeAgo(data.updatedAt || data.createdAt),
              indicator_id: data.indicator_id || '',
              createdAt: data.createdAt,
              updatedAtOriginal: data.updatedAt || data.createdAt,
              type: 'indication' as const,
              trash: data.trash,
              archived: data.archived,
            };
          })
          .filter((item) => item.trash !== true && item.archived !== true);
        
        updateAndSort();
      },
      (error) => {
        console.error('Erro ao buscar indicações:', error);
        if (onError) onError(error);
      }
    );

    // Query para oportunidades
    const opportunitiesRef = collection(db, 'opportunities');
    const opportunitiesQuery = query(
      opportunitiesRef,
      where('indicator_id', '==', userId)
    );

    const unsubOpportunities = onSnapshot(
      opportunitiesQuery,
      (snapshot) => {
        allOpportunities = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || '',
              status: data.status || '',
              product: data.product || '',
              updatedAt: formatTimeAgo(data.updatedAt || data.createdAt),
              indicator_id: data.indicator_id || '',
              createdAt: data.createdAt,
              updatedAtOriginal: data.updatedAt || data.createdAt,
              type: 'opportunity' as const,
              trash: data.trash,
              archived: data.archived,
            };
          })
          .filter((item) => item.trash !== true && item.archived !== true);
        
        updateAndSort();
      },
      (error) => {
        console.error('Erro ao buscar oportunidades:', error);
        if (onError) onError(error);
      }
    );

    // Query para indicações em massa (packagedIndications)
    const packagedIndicationsRef = collection(db, 'packagedIndications');
    const packagedIndicationsQuery = query(
      packagedIndicationsRef,
      where('indicator_id', '==', userId)
    );

    const unsubPackaged = onSnapshot(
      packagedIndicationsQuery,
      (snapshot) => {
        allBulk = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const progress = data.progress || 0;
            const total = data.total || data.indications?.length || 0;
            
            return {
              id: doc.id,
              name: 'Lote em massa',
              status: data.status || (progress === 100 ? 'Concluído' : 'Em Andamento'),
              product: `${total} indicações`,
              updatedAt: formatTimeAgo(data.updatedAt || data.createdAt),
              indicator_id: data.indicator_id,
              createdAt: data.createdAt,
              updatedAtOriginal: data.updatedAt || data.createdAt,
              type: 'bulk' as const,
              indications: data.indications || [],
              progress: progress,
              total: total,
              processed: data.processed || 0,
              packagedIndicationId: data.packagedIndicationId,
              unitName: data.unitName,
              archived: data.archived,
            };
          })
          .filter((item) => item.archived !== true);
        
        updateAndSort();
      },
      (error) => {
        console.error('Erro ao buscar lotes em massa:', error);
        if (onError) onError(error);
      }
    );

    // Retorna função para cancelar todas as inscrições
    return () => {
      unsubIndications();
      unsubOpportunities();
      unsubPackaged();
    };
  } catch (error) {
    console.error('Erro ao configurar listeners:', error);
    if (onError && error instanceof Error) {
      onError(error);
    }
    return () => {}; // Retorna função vazia em caso de erro
  }
}

/**
 * Filtra itens de status baseado na busca de texto e filtros selecionados
 */
export function filterStatusItems(
  items: UnifiedStatusItem[],
  searchText: string,
  selectedFilters: string[]
): UnifiedStatusItem[] {
  return items.filter((item) => {
    // Filtro de busca por texto
    const matchesSearch = searchText.trim() === '' || 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.product.toLowerCase().includes(searchText.toLowerCase()) ||
      item.status.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;

    // Se não há filtros selecionados, retorna todos os itens que passaram na busca
    if (selectedFilters.length === 0) return true;

    // Verifica filtros de tipo
    const hasTypeFilter = selectedFilters.some(filter => 
      ['APENAS OPORTUNIDADES', 'APENAS INDICAÇÕES', 'APENAS LOTES EM MASSA'].includes(filter)
    );

    const matchesTypeFilter = !hasTypeFilter || (
      (selectedFilters.includes('APENAS OPORTUNIDADES') && item.type === 'opportunity') ||
      (selectedFilters.includes('APENAS INDICAÇÕES') && item.type === 'indication') ||
      (selectedFilters.includes('APENAS LOTES EM MASSA') && item.type === 'bulk')
    );

    if (!matchesTypeFilter) return false;

    // Verifica filtros de status
    const statusFilters = selectedFilters.filter(filter => 
      !['APENAS OPORTUNIDADES', 'APENAS INDICAÇÕES', 'APENAS LOTES EM MASSA', '---'].includes(filter)
    );

    const matchesStatusFilter = statusFilters.length === 0 || 
      statusFilters.some(filter => item.status === filter);

    return matchesStatusFilter;
  });
}

/**
 * Calcula estatísticas dos itens de status
 * Retorna um objeto com a contagem de itens por status
 */
export function getStatusStats(items: UnifiedStatusItem[]): StatusStats {
  const stats: StatusStats = {};

  items.forEach((item) => {
    const status = item.status;
    if (status) {
      stats[status] = (stats[status] || 0) + 1;
    }
  });

  return stats;
}

/**
 * Obtém as iniciais de um nome para exibir no avatar
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const names = name.split(' ').filter(n => n.length > 0);
  const initials = names.map(n => n[0]).join('');
  return initials.substring(0, 2).toUpperCase();
}

/**
 * Limita o texto a um número máximo de caracteres, adicionando "..." se necessário
 */
export function limitText(text: string, maxLength: number = 25): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Obtém a cor do status baseado no seu valor
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'FECHADO':
      return '#10B981'; // green
    case 'NÃO FECHADO':
      return '#EF4444'; // red
    case 'AGUARDANDO CLIENTE':
      return '#820AD1'; // primary_purple
    case 'AGUARDANDO PAGAMENTO':
      return '#F28907'; // orange
    case 'CONTATO REALIZADO':
      return '#820AD1'; // primary_purple
    case 'PENDENTE CONTATO':
      return '#F28907'; // orange
    case 'NÃO INTERESSOU':
      return '#EF4444'; // red
    case 'INICIO DE PROPOSTA':
      return '#820AD1'; // primary_purple
    case 'PROPOSTA APRESENTADA':
      return '#820AD1'; // primary_purple
    case 'SEGURO RECUSADO':
      return '#EF4444'; // red
    default:
      return '#000000'; // black
  }
}

/**
 * Obtém a cor de fundo do status baseado no seu valor
 */
export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'FECHADO':
      return '#dcfce7'; // green-100
    case 'NÃO FECHADO':
      return '#fee2e2'; // red-100
    case 'AGUARDANDO PAGAMENTO':
      return '#fed7aa'; // orange-100
    case 'AGUARDANDO CLIENTE':
      return '#E6DBFF'; // purple-100
    case 'CONTATO REALIZADO':
      return '#E6DBFF'; // purple-100
    case 'PENDENTE CONTATO':
      return '#fed7aa'; // orange-100
    case 'NÃO INTERESSOU':
      return '#fee2e2'; // red-100
    case 'INICIO DE PROPOSTA':
      return '#E6DBFF'; // purple-100
    case 'PROPOSTA APRESENTADA':
      return '#E6DBFF'; // purple-100
    case 'SEGURO RECUSADO':
      return '#fee2e2'; // red-100
    default:
      return '#f3f4f6'; // gray-100
  }
}

/**
 * Formata número de telefone para exibição
 * Exemplo: (11) 98765-4321
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  
  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, '');
  
  // Formata conforme o tamanho
  if (numbers.length === 11) {
    // Celular: (XX) XXXXX-XXXX
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  
  return phone;
}

