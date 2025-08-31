import Button from '../../../components/ui/Button'

export default function Membership() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card p-6">
        <div className="text-sm text-gray-600 mb-1">Your status</div>
        <div className="text-lg font-semibold">Not a member</div>
      </div>
      <div className="card p-6 space-y-3">
        <div className="font-semibold">Pro Plan</div>
        <div className="text-3xl font-bold text-primary">£50.00<span className="text-base text-gray-600">/year</span></div>
        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li>Access to all paid courses</li>
          <li>Cancel anytime</li>
        </ul>
        <Button>Subscribe</Button>
      </div>
    </div>
  )
}
