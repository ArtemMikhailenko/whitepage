'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';
import { api } from '../../services/api';

// Типы данных
interface Asset {
  _id?: string;
  symbol: string;
  name: string;
  balance: number;
  equivalent: number;
  equivalentCurrency: string;
  icon: string;
}

interface Pnl {
  value: number;
  percentage: string;
}

interface WalletData {
  _id?: string;
  balance: number;
  currency: string;
  equivalentBalance: number;
  equivalentCurrency: string;
  pnl: Pnl;
  assets: Asset[];
}

export default function AdminPage() {
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    currency: '',
    equivalentBalance: 0,
    equivalentCurrency: '',
    pnl: {
      value: 0,
      percentage: '0.00'
    },
    assets: []
  });
  
  const [newAsset, setNewAsset] = useState<Omit<Asset, '_id'>>({
    symbol: '',
    name: '',
    balance: 0,
    equivalent: 0,
    equivalentCurrency: 'USD',
    icon: 'tether'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Загрузка данных кошелька при монтировании компонента
  useEffect(() => {
    fetchWalletData();
  }, []);

  // Получение данных кошелька с сервера
  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching wallet data...');
      const data = await api.getWallet();
      console.log('Received data:', data);
      if (data) {
        setWalletData(data);
      }
    } catch (error:any) {
      console.error('Error fetching wallet data:', error);
      // Display a more user-friendly error message
      alert(`Failed to load wallet data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик изменения основных данных кошелька
  const handleWalletDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setWalletData({
        ...walletData,
        [parent]: {
          ...walletData[parent as keyof WalletData] as object,
          [child]: parent === 'pnl' && child === 'value' ? parseFloat(value) : value
        }
      });
    } else {
      setWalletData({
        ...walletData,
        [name]: name.includes('balance') ? parseFloat(value) : value
      });
    }
  };

  // Обработчик изменения данных нового актива
  const handleNewAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAsset({
      ...newAsset,
      [name]: name.includes('balance') || name.includes('equivalent') ? parseFloat(value) : value
    });
  };

  // Обработчик изменения актива
  const handleAssetChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedAssets = [...walletData.assets];
    updatedAssets[index] = {
      ...updatedAssets[index],
      [name]: name.includes('balance') || name.includes('equivalent') ? parseFloat(value) : value
    };
    setWalletData({
      ...walletData,
      assets: updatedAssets
    });
  };

  // Добавление нового актива
  const handleAddAsset = async () => {
    if (!newAsset.symbol || !newAsset.name) {
      setMessage({ text: 'Символ и название актива обязательны', type: 'error' });
      return;
    }
    
    try {
      const addedAsset = await api.addAsset(newAsset);
      
      setWalletData({
        ...walletData,
        assets: [...walletData.assets, addedAsset]
      });
      
      // Сброс формы нового актива
      setNewAsset({
        symbol: '',
        name: '',
        balance: 0,
        equivalent: 0,
        equivalentCurrency: 'USD',
        icon: 'tether'
      });
      
      setMessage({ text: 'Актив добавлен', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Ошибка при добавлении актива', type: 'error' });
    }
  };

  // Удаление актива
  const handleDeleteAsset = async (id: string) => {
    try {
      await api.deleteAsset(id);
      
      const updatedAssets = walletData.assets.filter(asset => asset._id !== id);
      setWalletData({
        ...walletData,
        assets: updatedAssets
      });
      
      setMessage({ text: 'Актив удалён', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Ошибка при удалении актива', type: 'error' });
    }
  };

  // Сохранение данных кошелька
  const handleSaveWalletData = async () => {
    try {
      const updatedWallet = await api.updateWallet(walletData);
      
      if (updatedWallet) {
        setWalletData(updatedWallet);
        setMessage({ text: 'Данные успешно сохранены', type: 'success' });
      }
    } catch (error) {
      setMessage({ text: 'Ошибка при сохранении данных', type: 'error' });
    }
  };

  // Возврат на главную страницу
  const handleBack = () => {
    router.push('/');
  };

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Панель администратора</h1>
        <button className={styles.backButton} onClick={handleBack}>Вернуться</button>
      </header>
      
      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })}>✕</button>
        </div>
      )}
      
      <div className={styles.content}>
        <section className={styles.section}>
          <h2>Основные данные кошелька</h2>
          <div className={styles.formGroup}>
            <label>Баланс:</label>
            <input
              type="number"
              name="balance"
              value={walletData.balance}
              onChange={handleWalletDataChange}
              step="0.01"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Валюта:</label>
            <input
              type="text"
              name="currency"
              value={walletData.currency}
              onChange={handleWalletDataChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Эквивалентный баланс:</label>
            <input
              type="number"
              name="equivalentBalance"
              value={walletData.equivalentBalance}
              onChange={handleWalletDataChange}
              step="0.01"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Эквивалентная валюта:</label>
            <input
              type="text"
              name="equivalentCurrency"
              value={walletData.equivalentCurrency}
              onChange={handleWalletDataChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>PNL (значение):</label>
            <input
              type="number"
              name="pnl.value"
              value={walletData.pnl.value}
              onChange={handleWalletDataChange}
              step="0.01"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>PNL (процент):</label>
            <input
              type="text"
              name="pnl.percentage"
              value={walletData.pnl.percentage}
              onChange={handleWalletDataChange}
            />
          </div>
        </section>
        
        <section className={styles.section}>
          <h2>Активы</h2>
          
          <div className={styles.assetsTable}>
            <div className={styles.tableHeader}>
              <div>Символ</div>
              <div>Название</div>
              <div>Баланс</div>
              <div>Эквивалент</div>
              <div>Валюта</div>
              <div>Действия</div>
            </div>
            
            {walletData.assets.map((asset, index) => (
              <div key={asset._id} className={styles.tableRow}>
                <div>
                  <input
                    type="text"
                    name="symbol"
                    value={asset.symbol}
                    onChange={(e) => handleAssetChange(index, e)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="name"
                    value={asset.name}
                    onChange={(e) => handleAssetChange(index, e)}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="balance"
                    value={asset.balance}
                    onChange={(e) => handleAssetChange(index, e)}
                    step="0.00000001"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="equivalent"
                    value={asset.equivalent}
                    onChange={(e) => handleAssetChange(index, e)}
                    step="0.01"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="equivalentCurrency"
                    value={asset.equivalentCurrency}
                    onChange={(e) => handleAssetChange(index, e)}
                  />
                </div>
                <div>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => asset._id && handleDeleteAsset(asset._id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <h3>Добавить новый актив</h3>
          <div className={styles.newAssetForm}>
            <div className={styles.formGroup}>
              <label>Символ:</label>
              <input
                type="text"
                name="symbol"
                value={newAsset.symbol}
                onChange={handleNewAssetChange}
                placeholder="Например, BTC"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Название:</label>
              <input
                type="text"
                name="name"
                value={newAsset.name}
                onChange={handleNewAssetChange}
                placeholder="Например, Bitcoin"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Баланс:</label>
              <input
                type="number"
                name="balance"
                value={newAsset.balance}
                onChange={handleNewAssetChange}
                step="0.00000001"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Эквивалент:</label>
              <input
                type="number"
                name="equivalent"
                value={newAsset.equivalent}
                onChange={handleNewAssetChange}
                step="0.01"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Валюта:</label>
              <input
                type="text"
                name="equivalentCurrency"
                value={newAsset.equivalentCurrency}
                onChange={handleNewAssetChange}
              />
            </div>
            
            <button className={styles.addButton} onClick={handleAddAsset}>
              Добавить актив
            </button>
          </div>
        </section>
        
        <div className={styles.saveButtonContainer}>
          <button className={styles.saveButton} onClick={handleSaveWalletData}>
            Сохранить все изменения
          </button>
        </div>
      </div>
    </div>
  );
}