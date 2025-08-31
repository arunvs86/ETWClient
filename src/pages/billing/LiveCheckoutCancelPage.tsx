import { Link } from 'react-router-dom'

export default function LiveCheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg p-6 space-y-4 text-center">
      <h1 className="text-2xl font-semibold">Checkout canceled</h1>
      <p className="text-gray-700">No worries — you can resume anytime.</p>
      <div className="flex justify-center gap-3">
        <Link to="/live" className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">Back to live sessions</Link>
      </div>
    </div>
  )
}
