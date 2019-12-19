import { useRef, useState, useEffect } from 'react'

const defaultValues = {
  scrollX: 0,
  speedX: 0,
  scrollY: 0,
  speedY: 0,
}

export default (options = {}) => {
  const ref = useRef({ current: null })
  const [values, setValues] = useState(defaultValues)
  const { activeScrollPercent = 30 } = options

  const copyRef = element => {
    ref.current = element
    return element
  }

  const resetScroll = () => {
    setValues(defaultValues)
  }

  const handleDragOver = e => {
    if (!ref.current) {
      return
    }

    // Determine rectangle on screen
    const hoverBoundingRect = ref.current.getBoundingClientRect()
    // Get horizontal middle
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2
    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

    const hoverClientX = e.clientX - hoverBoundingRect.left
    const hoverClientY = e.clientY - hoverBoundingRect.top

    // Reset scroll area 100% - n%
    const resetScrollPercent = 100 - activeScrollPercent

    // Offset from middle X
    const offsetX = hoverClientX - hoverMiddleX
    // Offset from middle Y
    const offsetY = hoverClientY - hoverMiddleY
    // Percentage of offset from middle
    const percentX = Math.abs((100 / hoverMiddleX) * offsetX)
    const percentY = Math.abs((100 / hoverMiddleY) * offsetY)

    let newSpeedX = 0
    let newScrollX = 0
    let newSpeedY = 0
    let newScrollY = 0

    if (percentX > resetScrollPercent && percentX <= 100) {
      newSpeedX = Math.ceil(100 - (100 / activeScrollPercent) * (100 - percentX))
      newScrollX = hoverClientX < hoverMiddleX ? -1 : 1
    }

    if (percentY > resetScrollPercent && percentX <= 100) {
      newSpeedY = Math.ceil(100 - (100 / activeScrollPercent) * (100 - percentY))
      newScrollY = hoverClientY < hoverMiddleY ? -1 : 1
    }

    if (
      newSpeedX === values.speedX &&
      newScrollX === values.scrollX &&
      newSpeedY === values.speedY &&
      newScrollY === values.scrollY
    ) {
      return
    }

    setValues({
      speedX: newSpeedX,
      scrollX: newScrollX,
      speedY: newSpeedY,
      scrollY: newScrollY,
    })
  }

  useEffect(() => {
    if (ref.current) {
      const elem = ref.current

      elem.addEventListener('dragover', handleDragOver)
      elem.addEventListener('dragleave', resetScroll)
      elem.addEventListener('draglend', resetScroll)

      return () => {
        elem.removeEventListener('dragover', handleDragOver)
        elem.removeEventListener('dragleave', resetScroll)
        elem.removeEventListener('draglend', resetScroll)
      }
    }
  }, [ref.current]) // eslint-disable-line react-hooks/exhaustive-deps

  return [values, copyRef]
}
