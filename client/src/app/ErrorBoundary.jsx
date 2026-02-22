import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.error("Unhandled app error:", error);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-200 p-4" dir="rtl">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <h1 className="text-lg font-semibold text-slate-900 mb-2">משהו השתבש</h1>
            <p className="text-sm text-slate-600 mb-4">אפשר לנסות לרענן את האפליקציה ולהמשיך.</p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              רענן אפליקציה
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}