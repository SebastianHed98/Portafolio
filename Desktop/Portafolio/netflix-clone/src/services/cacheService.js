// Servicio de caché para datos de la API
class CacheService {
  constructor() {
    this.cache = new Map();
    this.maxAge = 30 * 60 * 1000; // 30 minutos
    this.maxSize = 100; // Máximo 100 items en caché
  }

  // Generar clave única para el caché
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join('|');
    return `${endpoint}|${sortedParams}`;
  }

  // Verificar si un item está en caché y es válido
  isValid(key) {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    return now - item.timestamp < this.maxAge;
  }

  // Obtener item del caché
  get(key) {
    if (this.isValid(key)) {
      const item = this.cache.get(key);
      console.log('📦 Cache hit:', key);
      return item.data;
    }

    // Remover item expirado
    this.cache.delete(key);
    console.log('❌ Cache miss:', key);
    return null;
  }

  // Guardar item en caché
  set(key, data) {
    // Limpiar caché si está lleno
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const item = {
      data,
      timestamp: Date.now(),
    };

    this.cache.set(key, item);
    console.log('💾 Cache saved:', key);
  }

  // Limpiar caché expirado
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp >= this.maxAge) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned ${expiredKeys.length} expired cache items`);
    }
  }

  // Limpiar todo el caché
  clear() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Obtener estadísticas del caché
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      maxAge: this.maxAge,
    };
  }

  // Guardar en localStorage para persistencia
  persist() {
    try {
      const cacheData = Array.from(this.cache.entries());
      localStorage.setItem('netflix-cache', JSON.stringify(cacheData));
      console.log('💾 Cache persisted to localStorage');
    } catch (error) {
      console.error('Error persisting cache:', error);
    }
  }

  // Cargar desde localStorage
  restore() {
    try {
      const cacheData = localStorage.getItem('netflix-cache');
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        this.cache = new Map(parsed);
        console.log('📦 Cache restored from localStorage');
      }
    } catch (error) {
      console.error('Error restoring cache:', error);
      this.cache.clear();
    }
  }

  // Función helper para hacer requests con caché
  async cachedRequest(endpoint, params = {}, requestFn) {
    const key = this.generateKey(endpoint, params);

    // Intentar obtener del caché
    const cachedData = this.get(key);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Hacer request real
      const data = await requestFn();

      // Guardar en caché
      this.set(key, data);

      // Persistir caché
      this.persist();

      return data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }
}

// Instancia singleton
const cacheService = new CacheService();

// Restaurar caché al inicializar
cacheService.restore();

export default cacheService;
