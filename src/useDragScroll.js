import { useRef, useEffect, useCallback } from 'react'
import throttle from 'lodash/throttle'

export default (options = {}) => {
  const ref = useRef(null)
  const timeRef = useRef(null)

  const {
    horizontalStartOffset = 0,
    verticalStartOffset = 0,
    maxStep = 10,
    maxTimeout = 10,
  } = options

  const update = ({ speedX, scrollX, speedY, scrollY }) => {
    clearTimeout(timeRef.current)

    const speed = speedX > speedY ? speedX : speedY
    // lower timeout if faster
    const timeout = maxTimeout - Math.ceil((speed / 100) * maxTimeout)

    // Sroll by y from 1 to max 10 pixels
    const x = scrollX * Math.ceil((speedX / 100) * maxStep)
    const y = scrollY * Math.ceil((speedY / 100) * maxStep)

    const scrollElem = () => {
      if (typeof ref.current.scrollBy === 'function') {
        ref.current.scrollBy(x, y)
      }

      timeRef.current = setTimeout(scrollElem, timeout)
    }

    if (scrollY !== 0 || scrollX !== 0) {
      scrollElem()
    }
  }

  const handleDragOver = throttle(e => {
    // Determine rectangle on screen
    const hoverBoundingRect = ref.current && typeof ref.current.getBoundingClientRect === 'function'
      ? ref.current.getBoundingClientRect()
      : { left: 0, right: ref.current.innerWidth, top: 0, bottom: ref.current.innerHeight }

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
  }, 100)

  const cancelUpdate = () => {
    clearTimeout(timeRef.current)
    handleDragOver.cancel()
  }

  const cleanUp = node => {
    if (node && typeof node.removeEventListener === 'function') {
      node.removeEventListener('dragover', handleDragOver)
      node.removeEventListener('dragleave', cancelUpdate)
      node.removeEventListener('dragend', cancelUpdate)
      node.removeEventListener('drop', cancelUpdate)
    }
    cancelUpdate()
    ref.current = null
  }

  const init = node => {
    if (node && typeof node.addEventListener === 'function') {
      node.addEventListener('dragover', handleDragOver)
      node.addEventListener('dragleave', cancelUpdate)
      node.addEventListener('dragend', cancelUpdate)
      node.addEventListener('drop', cancelUpdate)
    }
  }

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
