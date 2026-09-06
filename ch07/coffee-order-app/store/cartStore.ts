import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItemOption = {
  optionId: string
  name: string
  quantity: number
  unitPrice: number
}

export type CartItem = {
  id: string // cart item unique id
  menuId: string
  menuName: string
  quantity: number
  selectedOptions: {
    temperature?: string
    size?: { name: string; extraPrice: number }
    extras: CartItemOption[]
  }
  calculatedUnitPrice: number
  totalPrice: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  ongoingOrderIds: string[]
  addOngoingOrderId: (id: string) => void
  removeOngoingOrderId: (id: string) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      ongoingOrderIds: [],
      addItem: (item) =>
        set((state) => {
          const newItem = { ...item, id: crypto.randomUUID() }
          return { items: [...state.items, newItem] }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              const newQuantity = Math.max(1, quantity)
              return {
                ...item,
                quantity: newQuantity,
                totalPrice: item.calculatedUnitPrice * newQuantity,
              }
            }
            return item
          }),
        })),
      clearCart: () => set({ items: [] }),
      addOngoingOrderId: (id) =>
        set((state) => ({
          ongoingOrderIds: state.ongoingOrderIds.includes(id)
            ? state.ongoingOrderIds
            : [...state.ongoingOrderIds, id],
        })),
      removeOngoingOrderId: (id) =>
        set((state) => ({
          ongoingOrderIds: state.ongoingOrderIds.filter((oid) => oid !== id),
        })),
    }),
    {
      name: 'coffee-cart-storage',
    }
  )
)

