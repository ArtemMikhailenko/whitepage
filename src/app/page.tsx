'use client'
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { api } from '../services/api';

// Импорт иконок 
import { FiEye, FiRefreshCw, FiBarChart2, FiSearch, FiHome } from 'react-icons/fi';
import { IoCheckmarkCircle, IoChevronDown, IoChevronForward } from 'react-icons/io5';
import { RiSignalWifiLine, RiBattery2ChargeLine, RiExchangeLine } from 'react-icons/ri';
import { BiSignal5, BiLineChart } from 'react-icons/bi';
import { FaRegChartBar, FaExchangeAlt } from 'react-icons/fa';
import { SiTether } from 'react-icons/si';
import { VscPieChart } from "react-icons/vsc";
import { MdAccountBalanceWallet } from 'react-icons/md';
import { GrDocumentTime } from "react-icons/gr";
import { BiSolidBarChartSquare } from "react-icons/bi";

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

export default function CryptoWallet() {
  const router = useRouter();
  
  // Состояния для данных, которые можно изменять через админ-панель
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 68.09,
    currency: 'USDT',
    equivalentBalance: 68.08,
    equivalentCurrency: 'USD',
    pnl: {
      value: 0,
      percentage: '0.00'
    },
    assets: [
      {
        _id: '1',
        symbol: 'USDT',
        name: 'Tether',
        balance: 68.09720717,
        equivalent: 68.09,
        equivalentCurrency: 'USD',
        icon: 'tether'
      }
    ]
  });
  
  const [hideBalance, setHideBalance] = useState(false);
  const [showSmallBalances, setShowSmallBalances] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Новые состояния для pull-to-refresh
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);
  
  // Загрузка данных с сервера при монтировании компонента
  useEffect(() => {
    fetchWalletData();
    
    // Добавляем обработчики для pull-to-refresh
    if (typeof window !== 'undefined') {
      const main = document.querySelector(`.${styles.main}`);
      if (main) {
        main.addEventListener('touchstart', handleTouchStart, { passive: false });
        main.addEventListener('touchmove', handleTouchMove, { passive: false });
        main.addEventListener('touchend', handleTouchEnd, { passive: false });
      }
      
      return () => {
        if (main) {
          main.removeEventListener('touchstart', handleTouchStart);
          main.removeEventListener('touchmove', handleTouchMove);
          main.removeEventListener('touchend', handleTouchEnd);
        }
      };
    }
  }, []);
  
  // Обработчики для pull-to-refresh
  const handleTouchStart = (e:any) => {
    //@ts-ignore
    const scrollTop = document.querySelector(`.${styles.main}`).scrollTop;
    // Начинаем отслеживать pull только если страница прокручена до верха
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };
  
  const handleTouchMove = (e:any) => {
    if (!isPulling) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    // Ограничиваем смещение до 100px и только если тянем вниз
    if (diff > 0) {
      e.preventDefault(); // Предотвращаем стандартное поведение прокрутки
      const distance = Math.min(diff * 0.5, 100); // Замедляем эффект для более естественного ощущения
      setPullDistance(distance);
    }
  };
  
  const handleTouchEnd = () => {
    if (!isPulling) return;
    
    // Если потянули достаточно далеко, запускаем обновление
    if (pullDistance > 50) {
      setIsRefreshing(true);
      // Запускаем обновление данных
      fetchWalletData().then(() => {
        // После завершения обновления
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
        }, 1000); // Задержка для отображения анимации обновления
      });
    } else {
      // Если недостаточно потянули, возвращаем в исходное положение
      setPullDistance(0);
      setIsPulling(false);
    }
  };
  
  // Функция для загрузки данных с сервера
  const fetchWalletData = async () => {
    if (!isRefreshing) {
      setIsLoading(true);
    }
    try {
      const data = await api.getWallet();
      if (data) {
        setWalletData(data);
      }
      return true;
    } catch (error) {
      console.error('Ошибка при загрузке данных кошелька:', error);
      return false;
    } finally {
      if (!isRefreshing) {
        setIsLoading(false);
      }
    }
  };
  
  // Обработчик нажатия на вкладку Фючърси для перехода в админку
  const handleFuturesClick = () => {
    router.push('/admin');
  };
  
  // Обработчик обновления данных
  const handleRefresh = async () => {
    await fetchWalletData();
  };

  if (isLoading && !isRefreshing) {
    return <div className={styles.loading}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.5 5.5L22 12L16.5 18.5" stroke="#8F8F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'none' }} />
    <path d="M12 17L8.5 9L5 17H12Z" fill="#8F8F8F" />
    <path d="M19 17L15.5 9L12 17H19Z" fill="#8F8F8F" />
  </svg></div>;
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <Head>
        <title>Crypto Wallet</title>
        <meta name="description" content="Crypto wallet application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Индикатор pull-to-refresh */}
      {isPulling || isRefreshing ? (
        <div 
          className={styles.pullToRefresh} 
          style={{ 
            height: `${isRefreshing ? 60 : pullDistance}px`,
            opacity: isRefreshing ? 1 : pullDistance / 60
          }}
        >
          <div className={`${styles.refreshLoader} ${isRefreshing ? styles.refreshing : ''}`}>
            {/* Иконка горы, как в примере */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 5.5L22 12L16.5 18.5" stroke="#8F8F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'none' }} />
              <path d="M12 17L8.5 9L5 17H12Z" fill="#8F8F8F" />
              <path d="M19 17L15.5 9L12 17H19Z" fill="#8F8F8F" />
            </svg>
          </div>
        </div>
      ) : null}

      <main className={styles.main} style={{ transform: `translateY(${isPulling || isRefreshing ? pullDistance : 0}px)` }}>
        {/* Status Bar */}

        {/* Navigation Tabs */}
        <div className={styles.navTabs}>
          <div className={styles.navTab}>Общ преглед</div>
          <div className={`${styles.navTab} ${styles.activeTab}`}>Спот</div>
          <div className={styles.navTab}>DEX+</div>
          <div 
            className={styles.navTab} 
            onClick={handleFuturesClick}
            style={{ cursor: 'pointer' }}
          >
            Фючърси
          </div>
          <div className={styles.navTab}>Фиатно</div>
          <div className={styles.navTab}>Ко</div>
        </div>

        {/* Основное содержимое страницы остается без изменений */}
        {/* Balance Section */}
        <div className={styles.balanceSection}>
          <div className={styles.balanceHead}>
          <div className={styles.balanceHeader}>
            <span className={styles.balanceTitle}>Обща стойност</span>
            <span className={styles.eyeIcon} onClick={() => setHideBalance(!hideBalance)}>
              <FiEye size={10} />
            </span>
          </div>
          
          <div className={styles.balanceActions}>
          <div className={styles.chartIcon}>
              <VscPieChart size={20} />
            </div>
            <div className={styles.refreshIcon} onClick={handleRefresh}>
              <GrDocumentTime size={20} />
            </div>
            
          </div>
          </div>
          

          <div className={styles.balanceAmount}>
            <div className={styles.mainBalance}>
              {hideBalance ? '***.**' : walletData.balance.toFixed(2)}
            </div>
            <div className={styles.currencySelector}>
              {walletData.currency} <span className={styles.dropdownArrow}><IoChevronDown size={14} /></span>
            </div>
          </div>

          <div className={styles.equivalentBalance}>
            ≈{hideBalance ? '***.**' : walletData.equivalentBalance.toFixed(2)} {walletData.equivalentCurrency} <span className={styles.dropdownArrow}><IoChevronDown size={14} /></span>
          </div>

          <div className={styles.pnlInfo}>
            <span className={styles.pnlLabel}> <BiSolidBarChartSquare size={20} />Днешен PNL:</span>
            <span className={styles.pnlAmount}>
              {walletData.pnl.value} {walletData.equivalentCurrency} ({walletData.pnl.percentage}%)
            </span>
            <span className={styles.arrowIcon}><IoChevronForward size={16} /></span>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button className={styles.depositButton}>Депозит</button>
            <button className={styles.withdrawButton}>Изтегляне</button>
            <button className={styles.transferButton}>Прехвърляне</button>
          </div>

          {/* Convert Small Assets */}
          <div className={styles.convertAssetsButton}>
            <span className={styles.convertIcon}>
              <RiExchangeLine size={20} />
            </span>
            <span className={styles.convertText}>Преобразуване на малки активи</span>
            <span className={styles.rightArrow}><IoChevronForward size={16} /></span>
          </div>
        </div>

        {/* Assets List */}
        <div className={styles.assetsList}>
          <div className={styles.assetsHeader}>
            <h2 className={styles.assetsTitle}>Списък с активи</h2>
            <div className={styles.searchIcon}>
              <FiSearch size={20} />
            </div>
          </div>

          <div className={styles.assetsOptions}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox"
                checked={showSmallBalances}
                onChange={() => setShowSmallBalances(!showSmallBalances)}
                className={styles.checkbox}
              />
              <span className={styles.checkmarkCustom}></span>
              <span className={styles.checkboxText}>Скриване на малки баланси</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox"
                className={styles.checkbox}
              />
              <span className={styles.checkmarkCustom}></span>
              <span className={styles.checkboxText}>Опростен списък</span>
            </label>
          </div>

          {/* Asset Items */}
          {walletData.assets.map(asset => (
            <div key={asset._id} className={styles.assetItem}>
              <div className={styles.assetIcon}>
                {asset.icon === 'tether' && <SiTether size={32} color="#26A17B" />}
              </div>
              <div className={styles.assetDetails}>
                <div className={styles.assetNameRow}>
                  <span className={styles.assetSymbol}>{asset.symbol}</span>
                  <span className={styles.assetBalance}>
                    {hideBalance ? '***********' : asset.balance}
                  </span>
                </div>
                <div className={styles.assetSubRow}>
                  <span className={styles.assetName}>{asset.name}</span>
                  <span className={styles.assetEquivalent}>
                    ≈{hideBalance ? '***.**' : asset.equivalent} {asset.equivalentCurrency}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className={styles.bottomNav}>
          <div className={styles.navItem}>
            <div className={styles.navIcon}>
              <FiHome size={24} />
            </div>
            <div className={styles.navLabel}>Начало</div>
          </div>
          <div className={styles.navItem}>
            <div className={styles.navIcon}>
              <BiLineChart size={24} />
            </div>
            <div className={styles.navLabel}>Пазари</div>
          </div>
          <div className={styles.navItem}>
            <div className={styles.navIcon}>
              <FaExchangeAlt size={22} />
            </div>
            <div className={styles.navLabel}>Търговия</div>
          </div>
          <div className={styles.navItem}>
            <div className={styles.navIcon}>
              <FaRegChartBar size={22} />
            </div>
            <div className={styles.navLabel}>Фючърси</div>
          </div>
          <div className={`${styles.navItem} ${styles.activeNavItem}`}>
            <div className={styles.navIcon}>
              <MdAccountBalanceWallet size={24} />
            </div>
            <div className={styles.navLabel}>Портфейли</div>
          </div>
        </div>
        <div className={styles.bottomIndicator}></div>
      </main>
    </div>
  );
}