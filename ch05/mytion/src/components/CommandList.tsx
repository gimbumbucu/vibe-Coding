import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'

export interface CommandItem {
  title: string
  command: (props: { editor: any; range: any }) => void
}

interface CommandListProps {
  items: CommandItem[]
  command: (item: CommandItem) => void
}

export const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }
      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }
      if (event.key === 'Enter') {
        enterHandler()
        return true
      }
      return false
    },
  }))

  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden p-1 flex flex-col w-48 z-50">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`flex items-center text-left px-3 py-2 text-sm rounded-md transition-colors ${
              index === selectedIndex ? 'bg-gray-100 text-[#37352f] font-medium' : 'text-gray-700 hover:bg-gray-50'
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.title}
          </button>
        ))
      ) : (
        <div className="text-gray-500 text-sm px-3 py-2">결과 없음</div>
      )}
    </div>
  )
})

CommandList.displayName = 'CommandList'
