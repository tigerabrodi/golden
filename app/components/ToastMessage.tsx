import { Check, Close } from '~/icons'
import { Warning } from '~/icons/Warning'

export function ToastMessage({
  status,
  removeAlert,
  message,
}: {
  status: 'error' | 'success'
  removeAlert: () => void
  message: string
}) {
  return (
    <div className="toast">
      {status === 'error' ? <Warning /> : <Check />}
      <p>{message}</p>
      <button type="button" aria-label="Close" onClick={removeAlert}>
        <Close />
      </button>
    </div>
  )
}
