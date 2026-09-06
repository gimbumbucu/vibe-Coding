import { createClient } from '@/lib/supabase/server'
import { MenuBoard, OptionGroupType } from '@/components/customer/MenuBoard'
import { Menu } from '@/components/customer/MenuCard'

export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()
  
  const { data: menusData } = await supabase
    .from('menus')
    .select('*')
    .order('created_at', { ascending: true })

  const { data: menuOptionsData } = await supabase
    .from('menu_option_groups')
    .select(`
      menu_id,
      option_groups (
        id,
        name,
        is_required,
        is_multiple,
        option_items (
          id,
          name,
          extra_price
        )
      )
    `)

  const menus = menusData as Menu[] || []
  
  const menuOptionsMap: Record<string, OptionGroupType[]> = {}
  
  if (menuOptionsData) {
    menuOptionsData.forEach((row: any) => {
      const menuId = row.menu_id
      const group = row.option_groups
      if (!group) return
      
      if (!menuOptionsMap[menuId]) {
        menuOptionsMap[menuId] = []
      }
      menuOptionsMap[menuId].push(group)
    })
  }

  return (
    <main>
      <MenuBoard menus={menus} menuOptionsMap={menuOptionsMap} />
    </main>
  )
}
