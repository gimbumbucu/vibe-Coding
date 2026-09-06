import Image from 'next/image'

export interface Menu {
  id: string
  name: string
  price: number
  category: string
  is_sold_out: boolean
  image_url: string
}

interface MenuCardProps {
  menu: Menu
  onClick: (menu: Menu) => void
}

export function MenuCard({ menu, onClick }: MenuCardProps) {
  return (
    <div 
      className={`border border-border rounded-xl p-3.5 md:p-4 shadow-xs cursor-pointer transition-all hover:scale-[1.01] active:scale-95 flex flex-row md:flex-col items-center md:items-stretch gap-4 ${menu.is_sold_out ? 'opacity-60 pointer-events-none grayscale-[0.5] bg-muted' : 'bg-card text-card-foreground hover:shadow-md hover:border-primary/50'}`}
      onClick={() => onClick(menu)}
    >
      <div className="relative w-24 h-24 md:w-full md:h-auto md:aspect-square rounded-lg overflow-hidden bg-muted shrink-0">
        {menu.image_url && (
          <Image src={menu.image_url} alt={menu.name} fill className="object-cover" sizes="(max-width: 768px) 96px, (max-width: 1024px) 50vw, 33vw" />
        )}
        {menu.is_sold_out && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs md:text-sm font-bold px-2 py-0.5 md:px-3 md:py-1 bg-black/60 rounded-full">Sold Out</span>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center md:mt-auto">
        <h3 className="font-semibold text-foreground text-base md:text-lg">{menu.name}</h3>
        <p className="text-muted-foreground font-medium text-sm md:text-base mt-1">{menu.price.toLocaleString()}원</p>
      </div>
    </div>
  )
}
