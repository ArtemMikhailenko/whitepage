// services/api.js
const API_URL =  'https://white-back.onrender.com/api';

export const api = {
  // Получение данных кошелька
  async getWallet() {
    try {
      const response = await fetch(`${API_URL}/wallet`);
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      throw error;
    }
  },

  // Обновление данных кошелька
  async updateWallet(walletData) {
    const dataToSend = {
      ...walletData,
      balance: Number(walletData.balance),
      equivalentBalance: Number(walletData.equivalentBalance),
      // Если есть другие числовые поля, преобразуйте их также
    };
    try {
      const response = await fetch(`${API_URL}/wallet`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to update wallet data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating wallet data:', error);
      throw error;
    }
  },

  // Добавление нового актива
  async addAsset(assetData) {
    try {
      const response = await fetch(`${API_URL}/wallet/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        throw new Error('Failed to add asset');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  },

  // Обновление актива
  async updateAsset(id, assetData) {
    try {
      const response = await fetch(`${API_URL}/wallet/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update asset with ID ${id}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating asset with ID ${id}:`, error);
      throw error;
    }
  },

  // Удаление актива
  async deleteAsset(id) {
    try {
      const response = await fetch(`${API_URL}/wallet/assets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete asset with ID ${id}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting asset with ID ${id}:`, error);
      throw error;
    }
  },
};