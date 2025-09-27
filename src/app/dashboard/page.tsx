export default function DashboardPage() {
  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl font-semibold text-slate-800 mb-8">
        Your Dashboard
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Meetings Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Meetings</h3>
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10h-2v2h2v-2zm4-8H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l2 2V4c0-1.1-.9-2-2-2zM8 15c0 .55-.45 1-1 1s-1-.45-1-1v-2H3v2c0 1.1.9 2 2 2s2-.9 2-2v-2H8v2zM9 11H3c0-1.1.9-2 2-2s2 .9 2 2z"/>
              </svg>
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-4">
            Manage your automated meetings and transcriptions.
          </p>
          <button className="text-cyan-600 hover:text-cyan-700 font-medium text-sm">
            View All →
          </button>
        </div>

        {/* Agents Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Agents</h3>
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-4">
            Create and manage AI assistants for your meetings.
          </p>
          <button className="text-cyan-600 hover:text-cyan-700 font-medium text-sm">
            Manage Agents →
          </button>
        </div>

        {/* Upgrade Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Upgrade</h3>
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08L12 17.27z"/>
              </svg>
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-4">
            Unlock premium features and advanced capabilities.
          </p>
          <button className="text-cyan-600 hover:text-cyan-700 font-medium text-sm">
            Upgrade Now →
          </button>
        </div>
      </div>

    </div>
  );
}
