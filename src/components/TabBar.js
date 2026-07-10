function TabBar({ activeTab, onSwitch }) {
  return (
    <div className="tab-bar">
      <button
        className={`tab ${activeTab === "vote" ? "active" : ""}`}
        onClick={() => onSwitch("vote")}
      >
        Vote
      </button>
      <button
        className={`tab ${activeTab === "results" ? "active" : ""}`}
        onClick={() => onSwitch("results")}
      >
        Results
      </button>
    </div>
  );
}

export default TabBar;
