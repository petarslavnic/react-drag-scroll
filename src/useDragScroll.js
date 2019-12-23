import { useRef, useEffect, useCallback } from 'react'
import './utils/rAF.js'

export default (options = {}) => {
  const ref = useRef(null)
  const timeRef = useRef(null)
  const frameIdRef = useRef(null)

  const {
    horizontalStartOffset = 0,
    verticalStartOffset = 0,
    maxStep = 10,
    maxTimeout = 10,
  } = options

  const cancelUpdate = useCallback(() => {
    if (frameIdRef.current) {
      window.cancelAnimationFrame(frameIdRef.current)
    }
    clearTimeout(timeRef.current)
  }, [])

  const update = useCallback(({ speedX, scrollX, speedY, scrollY }) => {
    clearTimeout(timeRef.current)

    const speed = speedX > speedY ? speedX : speedY
    // lower timeout if faster
    const timeout = maxTimeout - Math.ceil((speed / 100) * maxTimeout)

    const scrollElem = () => {
      // Sroll by y from 1 to max 10 pixels
      const x = scrollX * Math.ceil((speedX / 100) * maxStep)
      const y = scrollY * Math.ceil((speedY / 100) * maxStep)

      if (typeof ref.current.scrollBy === 'function') {
        ref.current.scrollBy(x, y)
      }

      timeRef.current = setTimeout(scrollElem, timeout)
    }

    if (scrollY !== 0 || scrollX !== 0) {
      scrollElem()
    }
  }, [])

  const handleDragOver = useCallback(e => {
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

    const horizontalArea = 100 - horizontalStartOffset
    const verticalArea = 100 - verticalStartOffset

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

    if (horizontalStartOffset <= percentX && percentX <= 100) {
      newSpeedX = Math.ceil(100 - (100 / horizontalArea) * (100 - percentX))
      newScrollX = hoverClientX < hoverMiddleX ? -1 : 1
    }

    if (verticalStartOffset <= percentY && percentX <= 100) {
      newSpeedY = Math.ceil(100 - (100 / verticalArea) * (100 - percentY))
      newScrollY = hoverClientY < hoverMiddleY ? -1 : 1
    }

    update({
      speedX: newSpeedX,
      scrollX: newScrollX,
      speedY: newSpeedY,
      scrollY: newScrollY,
    })
  }, [])

  const debounceDragOver = useCallback(e => {
    if (frameIdRef.current) {
      window.cancelAnimationFrame(frameIdRef.current)
    }

    const start = Date.now()

    const timeout = () => {
      if (Date.now() - start >= 1) {
        handleDragOver(e)
      } else {
        frameIdRef.current = window.requestAnimationFrame(timeout)
      }
    }

    frameIdRef.current = window.requestAnimationFrame(timeout)
  }, [])

  const cleanUp = useCallback(node => {
    node.removeEventListener('dragover', debounceDragOver)
    node.removeEventListener('dragleave', cancelUpdate)
    node.removeEventListener('dragend', cancelUpdate)
    cancelUpdate()
    ref.current = null
  }, [])

  const init = useCallback(node => {
    node.addEventListener('dragover', debounceDragOver)
    node.addEventListener('dragleave', cancelUpdate)
    node.addEventListener('dragend', cancelUpdate)
  })

  useEffect(() => {
    return () => {
      cleanUp(ref.current)
    }
  }, [])

  const setRef = useCallback(node => {
    if (ref.current) {
      cleanUp(ref.current)
    }

    if (node) {
      init(node)
    }

    ref.current = node

    return ref
  }, [])

  return setRef
}
