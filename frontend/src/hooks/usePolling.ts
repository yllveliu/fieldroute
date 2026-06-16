import { useEffect, useRef } from 'react'

/**
 * Calls `callback` every `intervalMs` while `active` is true.
 * The latest callback is always used without resetting the interval,
 * and the interval is cleared on unmount or when `active` becomes false.
 */
export function usePolling(
  callback: () => void,
  intervalMs: number,
  active: boolean
) {
  const savedCallback = useRef(callback)
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!active) return
    const tick = () => savedCallback.current()
    const id = setInterval(tick, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, active])
}
