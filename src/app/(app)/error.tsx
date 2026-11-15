"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="error-state" role="alert">
    <div className="empty-icon" aria-hidden="true">!</div>
    <h1>That didn’t save.</h1>
    <p className="subtle">Something interrupted this request. Your latest change may not have been saved. Please try again.</p>
    <button className="primary-button" type="button" onClick={reset}>Try again</button>
  </main>;
}
