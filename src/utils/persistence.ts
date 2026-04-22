class Persistence {
    static setItem(key: string, value: unknown): void {
      localStorage.setItem(key, JSON.stringify(value));
    }
  
    static getItem<T>(key: string): T | null {
      const item = localStorage.getItem(key);
      // return item ? JSON.parse(item) : null;
      if (!item) {
        return null;
      }
  
      try {
        return JSON.parse(item);
      } catch (error) {
        console.warn(
          `Failed to parse localStorage item for key "${key}":`,
          error
        );
        // If parsing fails, remove the corrupted item and return null
        this.removeItem(key);
        return null;
      }
    }
  
    static removeItem(key: string): void {
      localStorage.removeItem(key);
    }
  }
  
  export default Persistence;
  