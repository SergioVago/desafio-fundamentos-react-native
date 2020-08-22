import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      try {
        const storageProducts = await AsyncStorage.getItem(
          '@GoMarketplace:products',
        );
        console.log('storageProducts :>> ', storageProducts);
        if (storageProducts) setProducts(JSON.parse(storageProducts));
      } catch (err) {
        console.error(err);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const findedIndex = products.findIndex(
        productsItem => productsItem.id === id,
      );

      const productsList = [...products];
      productsList[findedIndex].quantity += 1;
      setProducts(productsList);
      AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const findedIndex = products.findIndex(
        productsItem => productsItem.id === id,
      );

      const productsList = [...products];
      productsList[findedIndex].quantity -= 1;
      !productsList[findedIndex].quantity &&
        productsList.splice(findedIndex, 1);
      setProducts(productsList);
      AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products));
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      const findedProduct = products.find(
        productsItem => productsItem.id === product.id,
      );

      if (findedProduct) {
        increment(findedProduct.id);
      } else {
        const newProduct = product;
        newProduct.quantity = 1;
        setProducts([...products, newProduct]);
      }

      AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products));
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
