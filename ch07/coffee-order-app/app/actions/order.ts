'use server'

import { createClient } from '@/lib/supabase/server'
import { CartItem } from '@/store/cartStore'

export async function createOrderAction(cartItems: CartItem[], totalPrice: number) {
  const supabase = await createClient()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      total_price: totalPrice,
      status: 'PENDING'
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('Order creation error:', orderError)
    throw new Error('주문 생성에 실패했습니다.')
  }

  for (const item of cartItems) {
    const { data: orderItem, error: orderItemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        menu_id: item.menuId,
        menu_name: item.menuName,
        quantity: item.quantity,
        unit_price: item.calculatedUnitPrice
      })
      .select()
      .single()

    if (orderItemError || !orderItem) {
      console.error('OrderItem creation error:', orderItemError)
      continue
    }

    const optionsToInsert = []
    if (item.selectedOptions.temperature) {
      optionsToInsert.push({
        order_item_id: orderItem.id,
        name: `온도: ${item.selectedOptions.temperature}`,
        quantity: 1,
        unit_price: 0
      })
    }
    if (item.selectedOptions.size) {
      optionsToInsert.push({
        order_item_id: orderItem.id,
        name: `사이즈: ${item.selectedOptions.size.name}`,
        quantity: 1,
        unit_price: item.selectedOptions.size.extraPrice
      })
    }
    if (item.selectedOptions.extras && item.selectedOptions.extras.length > 0) {
      item.selectedOptions.extras.forEach(extra => {
        optionsToInsert.push({
          order_item_id: orderItem.id,
          option_item_id: extra.optionId,
          name: extra.name,
          quantity: extra.quantity,
          unit_price: extra.unitPrice
        })
      })
    }

    if (optionsToInsert.length > 0) {
      const { error: optionsError } = await supabase
        .from('order_item_options')
        .insert(optionsToInsert)
        
      if (optionsError) console.error('OrderItemOptions creation error:', optionsError)
    }
  }

  return order.id
}
