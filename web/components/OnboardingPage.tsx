import Masthead from './Masthead'

export default function OnboardingPage() {
  return (
    <main className="newspaper" aria-label="The Daily Byte — Setup Required">
      <a className="sr-only" href="#main-content">Skip to main content</a>
      <Masthead />
      <hr className="rule rule--thick" />
      <div className="onboarding" id="main-content">
        <p className="onboarding__vol">Vol. I, No. 0 — Inaugural Edition Pending</p>
        <h2 className="onboarding__headline">
          Your First Edition Has Not Yet Been Published
        </h2>
        <div className="onboarding__body">
          <p>
            The presses stand ready, the ink freshly mixed, and the
            correspondents await their dispatches. To publish your inaugural
            edition, run the following command from your terminal:
          </p>
          <br />
          <code className="onboarding__code">npm run fetch --workspace=skill</code>
          <br /><br />
          <p>
            Ensure <code className="onboarding__code">ANTHROPIC_API_KEY</code> is
            set in your environment, or that openclaw is running with an active
            session.
          </p>
          <br />
          <p>
            The paper shall arrive fresh each morning at 07:00 UTC.
          </p>
        </div>
      </div>
    </main>
  )
}
