export function logIPC(channel: string, direction: 'in' | 'out', payload?: any) {
  const dir = direction === 'in' ? '➡️  IN ' : '⬅️  OUT'
  console.log(`[IPC ${dir}] ${channel}`, payload ?? '')
}
