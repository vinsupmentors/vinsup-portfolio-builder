export default function Thanks() {
  return (
    <div className="thanks-wrap">
      <div className="thanks-icon">✓</div>
      <h1>Thanks for submitting!</h1>
      <p>
        Your portfolio has been sent to Vinsup Skill Academy for review.
        Once it is approved, your personal portfolio link will be shared with you.
      </p>
      <p style={{ marginTop: 24 }}>
        <span className="powered">Powered by <span className="vs-mark" style={{ color: '#1d4ed8', fontWeight: 700 }}>Vinsup <span style={{ color: '#dc2626' }}>Skill</span> Academy</span></span>
      </p>
    </div>
  );
}
