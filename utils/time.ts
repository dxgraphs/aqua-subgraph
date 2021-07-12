import type { Dayjs } from 'dayjs'

export function wait(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms)
  })
}

export function toUTC(dayjs: Dayjs): Dayjs {
  const utcMinutesOffset = dayjs.utcOffset()
  return dayjs.add(utcMinutesOffset, 'minutes')
}
