import { createContext, useContext } from 'react';
export const PortfolioContext = createContext();
export function usePortfolio(){ const context=useContext(PortfolioContext); if(!context) throw new Error('PortfolioProvider required'); return context; }
